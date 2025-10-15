import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

export interface NotificationJobData {
  type: 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';
  recipient: string;
  message: string;
  subject?: string;
  data?: any;
  priority?: 'high' | 'normal' | 'low';
  tenantId?: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>) {
    const { type, recipient, message, subject, data, priority, tenantId, userId, entityId, entityType } = job.data;

    this.logger.log(`Processing ${type} notification for ${recipient} (Job ID: ${job.id})`);

    try {
      let result: any = {
        success: false,
        type,
        recipient,
        tenantId,
        userId,
      };

      switch (type) {
        case 'SMS':
          result = await this.sendSMS(recipient, message, tenantId);
          break;
        case 'WHATSAPP':
          result = await this.sendWhatsApp(recipient, message, data, tenantId);
          break;
        case 'PUSH':
          result = await this.sendPushNotification(recipient, message, subject, data, tenantId, userId);
          break;
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }

      // Log notification to database
      await this.logNotification({
        type,
        recipient,
        message,
        subject,
        data,
        tenantId,
        userId,
        entityId,
        entityType,
        status: result.success ? 'SENT' : 'FAILED',
        error: result.error,
        sentAt: result.success ? new Date() : undefined,
      });

      this.logger.log(`${type} notification processed successfully for ${recipient}`);

      job.progress(100);

      return result;
    } catch (error) {
      this.logger.error(`Failed to process ${type} notification for ${recipient}:`, error);

      // Log failed notification
      await this.logNotification({
        type,
        recipient,
        message,
        subject,
        data,
        tenantId,
        userId,
        entityId,
        entityType,
        status: 'FAILED',
        error: error.message,
      });

      // Retry logic for transient errors
      if (job.attemptsMade < 3 && this.isTransientError(error)) {
        this.logger.log(`Retrying ${type} notification (attempt ${job.attemptsMade + 1}/3)`);
        throw error;
      }

      throw error;
    }
  }

  @Process('send-booking-reminder')
  async handleBookingReminder(job: Job<{
    bookingId: string;
    customerEmail: string;
    customerPhone: string;
    departureDate: string;
    bookingCode: string;
    tenantId: string;
  }>) {
    const { bookingId, customerEmail, customerPhone, departureDate, bookingCode, tenantId } = job.data;

    this.logger.log(`Processing booking reminder for booking ${bookingId} (Job ID: ${job.id})`);

    try {
      const daysUntilDeparture = Math.ceil(
        (new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeparture <= 0) {
        this.logger.log(`Skipping reminder for past booking ${bookingId}`);
        return { skipped: true, reason: 'booking_date_passed' };
      }

      const message = `This is a reminder for your upcoming Digital Umroh booking ${bookingCode}. Your departure is in ${daysUntilDeparture} days on ${departureDate}. Please ensure all documents are ready and you have completed all payments.`;

      // Send email reminder (will be processed by mail queue)
      await this.queueEmailNotification({
        to: customerEmail,
        subject: `Booking Reminder - ${bookingCode}`,
        template: 'booking-reminder',
        context: {
          bookingCode,
          departureDate,
          daysUntilDeparture,
          customerName: 'Valued Customer', // Would be fetched from database
        },
        tenantId,
      });

      // Send SMS reminder
      if (customerPhone) {
        await this.sendSMS(customerPhone, message, tenantId);
      }

      this.logger.log(`Booking reminder processed successfully for booking ${bookingId}`);

      job.progress(100);

      return {
        success: true,
        bookingId,
        bookingCode,
        daysUntilDeparture,
        emailSent: true,
        smsSent: !!customerPhone,
      };
    } catch (error) {
      this.logger.error(`Failed to process booking reminder for booking ${bookingId}:`, error);
      throw error;
    }
  }

  @Process('send-payment-reminder')
  async handlePaymentReminder(job: Job<{
    invoiceId: string;
    customerEmail: string;
    customerPhone: string;
    dueDate: string;
    amount: number;
    invoiceNumber: string;
    tenantId: string;
  }>) {
    const { invoiceId, customerEmail, customerPhone, dueDate, amount, invoiceNumber, tenantId } = job.data;

    this.logger.log(`Processing payment reminder for invoice ${invoiceId} (Job ID: ${job.id})`);

    try {
      const daysUntilDue = Math.ceil(
        (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDue < 0) {
        this.logger.log(`Skipping reminder for overdue invoice ${invoiceId}`);
        return { skipped: true, reason: 'invoice_overdue' };
      }

      const message = `Payment reminder: Your Digital Umroh invoice ${invoiceNumber} for amount ${amount} is due in ${daysUntilDue} days on ${dueDate}. Please complete your payment to avoid any service interruption.`;

      // Send email reminder
      await this.queueEmailNotification({
        to: customerEmail,
        subject: `Payment Reminder - Invoice ${invoiceNumber}`,
        template: 'payment-reminder',
        context: {
          invoiceNumber,
          amount,
          dueDate,
          daysUntilDue,
          customerName: 'Valued Customer', // Would be fetched from database
        },
        tenantId,
      });

      // Send SMS reminder for urgent cases
      if (customerPhone && daysUntilDue <= 3) {
        await this.sendSMS(customerPhone, message, tenantId);
      }

      this.logger.log(`Payment reminder processed successfully for invoice ${invoiceId}`);

      job.progress(100);

      return {
        success: true,
        invoiceId,
        invoiceNumber,
        daysUntilDue,
        emailSent: true,
        smsSent: customerPhone && daysUntilDue <= 3,
      };
    } catch (error) {
      this.logger.error(`Failed to process payment reminder for invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  @Process('process-webhook-event')
  async handleWebhookEvent(job: Job<{
    event: string;
    data: any;
    source: string;
    tenantId?: string;
    processed: boolean;
  }>) {
    const { event, data, source, tenantId, processed } = job.data;

    this.logger.log(`Processing webhook event ${event} from ${source} (Job ID: ${job.id})`);

    try {
      // Log webhook event
      await this.prisma.webhookLog.create({
        data: {
          event,
          source,
          data: JSON.parse(JSON.stringify(data)),
          tenant_id: tenantId,
          processed,
          received_at: new Date(),
        },
      });

      // Process specific webhook events
      if (source === 'payment' && event.includes('payment')) {
        await this.processPaymentWebhook(event, data, tenantId);
      } else if (source === 'notification' && event.includes('delivery')) {
        await this.processNotificationWebhook(event, data, tenantId);
      }

      this.logger.log(`Webhook event ${event} processed successfully`);

      job.progress(100);

      return {
        success: true,
        event,
        source,
        processed: true,
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event}:`, error);
      throw error;
    }
  }

  private async sendSMS(recipient: string, message: string, tenantId?: string): Promise<any> {
    // This would integrate with an SMS provider like Twilio, Nexmo, etc.
    this.logger.log(`Sending SMS to ${recipient}: ${message.substring(0, 50)}...`);

    // Mock implementation for now
    return {
      success: true,
      type: 'SMS',
      recipient,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cost: 0.05,
    };
  }

  private async sendWhatsApp(recipient: string, message: string, data?: any, tenantId?: string): Promise<any> {
    // This would integrate with WhatsApp API (WAHA, Twilio WhatsApp, etc.)
    this.logger.log(`Sending WhatsApp message to ${recipient}: ${message.substring(0, 50)}...`);

    // Mock implementation for now
    return {
      success: true,
      type: 'WHATSAPP',
      recipient,
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private async sendPushNotification(
    recipient: string,
    message: string,
    subject?: string,
    data?: any,
    tenantId?: string,
    userId?: string,
  ): Promise<any> {
    // This would integrate with push notification service like Firebase Cloud Messaging
    this.logger.log(`Sending push notification to ${recipient}: ${subject || message.substring(0, 50)}...`);

    // Mock implementation for now
    return {
      success: true,
      type: 'PUSH',
      recipient,
      messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private async queueEmailNotification(emailData: any): Promise<void> {
    // This would add email job to the mail queue
    this.logger.log(`Queuing email notification to ${emailData.to}`);
    // Implementation would use the Bull queue service
  }

  private async processPaymentWebhook(event: string, data: any, tenantId?: string): Promise<void> {
    this.logger.log(`Processing payment webhook: ${event}`);
    // Handle payment-specific webhook events
  }

  private async processNotificationWebhook(event: string, data: any, tenantId?: string): Promise<void> {
    this.logger.log(`Processing notification webhook: ${event}`);
    // Handle notification-specific webhook events (delivery receipts, etc.)
  }

  private async logNotification(notificationData: {
    type: string;
    recipient: string;
    message: string;
    subject?: string;
    data?: any;
    tenantId?: string;
    userId?: string;
    entityId?: string;
    entityType?: string;
    status: string;
    error?: string;
    sentAt?: Date;
  }): Promise<void> {
    try {
      await this.prisma.notificationLog.create({
        data: {
          type: notificationData.type,
          recipient: notificationData.recipient,
          message: notificationData.message,
          subject: notificationData.subject,
          data: notificationData.data ? JSON.parse(JSON.stringify(notificationData.data)) : null,
          tenant_id: notificationData.tenantId,
          user_id: notificationData.userId,
          entity_id: notificationData.entityId,
          entity_type: notificationData.entityType,
          status: notificationData.status,
          error: notificationData.error,
          sent_at: notificationData.sentAt,
          created_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log notification to database:', error);
    }
  }

  private isTransientError(error: any): boolean {
    const transientErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    const transientErrorMessages = [
      'Connection timeout',
      'Connection reset',
      'Temporary failure',
      'Service unavailable',
      'Rate limit exceeded',
    ];

    const errorMessage = error.message || '';
    const errorCode = error.code || '';

    return (
      transientErrorCodes.includes(errorCode) ||
      transientErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase()))
    );
  }
}