import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface MailJobData {
  to: string | string[];
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
  from?: string;
  priority?: 'high' | 'normal' | 'low';
  tenantId?: string;
  userId?: string;
}

@Processor('mail')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job<MailJobData>) {
    const { to, subject, template, context, html, text, from, priority, tenantId, userId } = job.data;

    this.logger.log(`Processing email job for ${to} (Job ID: ${job.id})`);

    try {
      const defaultFrom = from || this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com');

      let emailOptions: any = {
        to,
        from: defaultFrom,
        subject,
      };

      if (html) {
        emailOptions.html = html;
      } else if (template && context) {
        emailOptions.template = template;
        emailOptions.context = context;
      }

      if (text) {
        emailOptions.text = text;
      }

      // Add tenant-specific headers if tenantId is provided
      if (tenantId) {
        emailOptions.headers = {
          'X-Tenant-ID': tenantId,
          'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
        };
      }

      const result = await this.mailerService.sendMail(emailOptions);

      this.logger.log(`Email sent successfully to ${to} (Message ID: ${result.messageId})`);

      // Update job progress
      job.progress(100);

      return {
        success: true,
        messageId: result.messageId,
        to,
        subject,
        tenantId,
        userId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);

      // Retry logic for transient errors
      if (job.attemptsMade < 3 && this.isTransientError(error)) {
        this.logger.log(`Retrying email job (attempt ${job.attemptsMade + 1}/3)`);
        throw error; // This will trigger a retry
      }

      throw error;
    }
  }

  @Process('send-otp')
  async handleSendOTP(job: Job<{ to: string; otp: string; name?: string; tenantId?: string }>) {
    const { to, otp, name, tenantId } = job.data;

    this.logger.log(`Processing OTP email for ${to} (Job ID: ${job.id})`);

    try {
      const emailOptions = {
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        subject: 'Your Digital Umroh Verification Code',
        template: 'otp',
        context: {
          name: name || 'User',
          otp,
          companyName: 'Digital Umroh',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@digital-umroh.com'),
        },
        headers: tenantId ? {
          'X-Tenant-ID': tenantId,
          'X-Purpose': 'otp-verification',
        } : undefined,
      };

      const result = await this.mailerService.sendMail(emailOptions);

      this.logger.log(`OTP email sent successfully to ${to} (Message ID: ${result.messageId})`);

      job.progress(100);

      return {
        success: true,
        messageId: result.messageId,
        to,
        purpose: 'otp-verification',
        tenantId,
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, error);
      throw error;
    }
  }

  @Process('send-booking-confirmation')
  async handleBookingConfirmation(job: Job<{
    to: string;
    bookingCode: string;
    packageName: string;
    customerName: string;
    totalAmount: number;
    departureDate: string;
    tenantId: string;
  }>) {
    const { to, bookingCode, packageName, customerName, totalAmount, departureDate, tenantId } = job.data;

    this.logger.log(`Processing booking confirmation email for ${to} (Job ID: ${job.id})`);

    try {
      const emailOptions = {
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        subject: `Booking Confirmation - ${bookingCode}`,
        template: 'booking-confirmation',
        context: {
          customerName,
          bookingCode,
          packageName,
          totalAmount,
          departureDate,
          companyName: 'Digital Umroh',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@digital-umroh.com'),
          websiteUrl: this.configService.get<string>('FRONTEND_URL', 'https://digital-umroh.com'),
        },
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Purpose': 'booking-confirmation',
          'X-Booking-Code': bookingCode,
        },
      };

      const result = await this.mailerService.sendMail(emailOptions);

      this.logger.log(`Booking confirmation email sent successfully to ${to} (Message ID: ${result.messageId})`);

      job.progress(100);

      return {
        success: true,
        messageId: result.messageId,
        to,
        bookingCode,
        purpose: 'booking-confirmation',
        tenantId,
      };
    } catch (error) {
      this.logger.error(`Failed to send booking confirmation email to ${to}:`, error);
      throw error;
    }
  }

  @Process('send-payment-confirmation')
  async handlePaymentConfirmation(job: Job<{
    to: string;
    paymentId: string;
    amount: number;
    paymentMethod: string;
    invoiceNumber?: string;
    tenantId: string;
  }>) {
    const { to, paymentId, amount, paymentMethod, invoiceNumber, tenantId } = job.data;

    this.logger.log(`Processing payment confirmation email for ${to} (Job ID: ${job.id})`);

    try {
      const emailOptions = {
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        subject: `Payment Confirmation - ${invoiceNumber || paymentId}`,
        template: 'payment-confirmation',
        context: {
          paymentId,
          invoiceNumber,
          amount,
          paymentMethod,
          companyName: 'Digital Umroh',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@digital-umroh.com'),
          websiteUrl: this.configService.get<string>('FRONTEND_URL', 'https://digital-umroh.com'),
        },
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Purpose': 'payment-confirmation',
          'X-Payment-ID': paymentId,
        },
      };

      const result = await this.mailerService.sendMail(emailOptions);

      this.logger.log(`Payment confirmation email sent successfully to ${to} (Message ID: ${result.messageId})`);

      job.progress(100);

      return {
        success: true,
        messageId: result.messageId,
        to,
        paymentId,
        purpose: 'payment-confirmation',
        tenantId,
      };
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation email to ${to}:`, error);
      throw error;
    }
  }

  @Process('send-invoice')
  async handleSendInvoice(job: Job<{
    to: string;
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    customerName: string;
    tenantId: string;
  }>) {
    const { to, invoiceNumber, totalAmount, dueDate, customerName, tenantId } = job.data;

    this.logger.log(`Processing invoice email for ${to} (Job ID: ${job.id})`);

    try {
      const emailOptions = {
        to,
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        subject: `Invoice ${invoiceNumber}`,
        template: 'invoice',
        context: {
          invoiceNumber,
          customerName,
          totalAmount,
          dueDate,
          companyName: 'Digital Umroh',
          supportEmail: this.configService.get<string>('SUPPORT_EMAIL', 'support@digital-umroh.com'),
          websiteUrl: this.configService.get<string>('FRONTEND_URL', 'https://digital-umroh.com'),
        },
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Purpose': 'invoice-notification',
          'X-Invoice-Number': invoiceNumber,
        },
        attachments: [
          {
            filename: `invoice-${invoiceNumber}.pdf`,
            content: Buffer.from(''), // This would be generated PDF content
            contentType: 'application/pdf',
          },
        ],
      };

      const result = await this.mailerService.sendMail(emailOptions);

      this.logger.log(`Invoice email sent successfully to ${to} (Message ID: ${result.messageId})`);

      job.progress(100);

      return {
        success: true,
        messageId: result.messageId,
        to,
        invoiceNumber,
        purpose: 'invoice-notification',
        tenantId,
      };
    } catch (error) {
      this.logger.error(`Failed to send invoice email to ${to}:`, error);
      throw error;
    }
  }

  private isTransientError(error: any): boolean {
    // Define what constitutes a transient error that should be retried
    const transientErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    const transientErrorMessages = [
      'Connection timeout',
      'Connection reset',
      'Temporary failure',
      'Service unavailable',
    ];

    const errorMessage = error.message || '';
    const errorCode = error.code || '';

    return (
      transientErrorCodes.includes(errorCode) ||
      transientErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase()))
    );
  }
}