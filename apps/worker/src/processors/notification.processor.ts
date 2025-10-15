import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE, JOB_TYPES, NOTIFICATION_CHANNELS } from '../queues/queue.constants';
import { WhatsAppService } from '../services/whatsapp.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { PrismaService } from '../database/prisma.service';

interface NotificationJob {
  tenantId: string;
  recipientId: string;
  type: string;
  channel: string;
  title: string;
  content: string;
  templateKey?: string;
  templateData?: Record<string, any>;
  priority?: string;
  scheduledAt?: string;
}

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Process(JOB_TYPES.SEND_WHATSAPP)
  async sendWhatsApp(job: Job<NotificationJob>) {
    const { data } = job;
    this.logger.log(`Processing WhatsApp notification for tenant ${data.tenantId}`);

    try {
      // Rate limiting check per tenant
      await this.checkRateLimit(data.tenantId, NOTIFICATION_CHANNELS.WHATSAPP);

      // Get recipient details
      const recipient = await this.getRecipient(data.recipientId, data.tenantId);
      if (!recipient) {
        throw new Error(`Recipient not found: ${data.recipientId}`);
      }

      // Send WhatsApp message
      const result = await this.whatsappService.sendMessage({
        to: recipient.phone,
        message: data.content,
        templateKey: data.templateKey,
        templateData: data.templateData,
        tenantId: data.tenantId,
      });

      // Update notification record
      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'SENT',
        result
      );

      this.logger.log(`WhatsApp message sent successfully to ${recipient.phone}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`, error.stack);

      // Update notification status to failed
      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'FAILED',
        null,
        error.message
      );

      throw error;
    }
  }

  @Process(JOB_TYPES.SEND_EMAIL)
  async sendEmail(job: Job<NotificationJob>) {
    const { data } = job;
    this.logger.log(`Processing email notification for tenant ${data.tenantId}`);

    try {
      // Get recipient details
      const recipient = await this.getRecipient(data.recipientId, data.tenantId);
      if (!recipient) {
        throw new Error(`Recipient not found: ${data.recipientId}`);
      }

      // Send email
      const result = await this.emailService.sendEmail({
        to: recipient.email,
        subject: data.title,
        template: data.templateKey,
        data: data.templateData,
        tenantId: data.tenantId,
      });

      // Update notification record
      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'SENT',
        result
      );

      this.logger.log(`Email sent successfully to ${recipient.email}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'FAILED',
        null,
        error.message
      );

      throw error;
    }
  }

  @Process(JOB_TYPES.SEND_SMS)
  async sendSms(job: Job<NotificationJob>) {
    const { data } = job;
    this.logger.log(`Processing SMS notification for tenant ${data.tenantId}`);

    try {
      // Rate limiting check
      await this.checkRateLimit(data.tenantId, NOTIFICATION_CHANNELS.SMS);

      const recipient = await this.getRecipient(data.recipientId, data.tenantId);
      if (!recipient) {
        throw new Error(`Recipient not found: ${data.recipientId}`);
      }

      const result = await this.smsService.sendSms({
        to: recipient.phone,
        message: data.content,
        tenantId: data.tenantId,
      });

      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'SENT',
        result
      );

      this.logger.log(`SMS sent successfully to ${recipient.phone}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);

      await this.updateNotificationStatus(
        job.id as string,
        data.tenantId,
        'FAILED',
        null,
        error.message
      );

      throw error;
    }
  }

  private async checkRateLimit(tenantId: string, channel: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true, usage: true },
    });

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const settings = tenant.settings as any;
    const usage = tenant.usage as any;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check WhatsApp rate limit (10 messages per minute)
    if (channel === NOTIFICATION_CHANNELS.WHATSAPP) {
      const limit = settings.whatsapp_limit_per_minute || 10;
      const recentCount = await this.prisma.notification.count({
        where: {
          tenant_id: tenantId,
          channel: NOTIFICATION_CHANNELS.WHATSAPP,
          status: 'SENT',
          sent_at: {
            gte: new Date(now.getTime() - 60000), // Last minute
          },
        },
      });

      if (recentCount >= limit) {
        throw new Error(`WhatsApp rate limit exceeded for tenant ${tenantId}`);
      }
    }

    // Check daily limits
    if (usage.whatsapp_today >= settings.whatsapp_per_day) {
      throw new Error(`Daily WhatsApp limit exceeded for tenant ${tenantId}`);
    }
  }

  private async getRecipient(recipientId: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: recipientId,
        tenant_id: tenantId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
      },
    });
  }

  private async updateNotificationStatus(
    notificationId: string,
    tenantId: string,
    status: string,
    providerResponse: any,
    failureReason?: string
  ) {
    const updateData: any = {
      status,
      provider_response: providerResponse,
    };

    if (status === 'SENT') {
      updateData.sent_at = new Date();
    } else if (status === 'FAILED') {
      updateData.failed_at = new Date();
      updateData.failure_reason = failureReason;
    }

    // Update by external_id (job.id)
    await this.prisma.notification.updateMany({
      where: {
        tenant_id: tenantId,
        external_id: notificationId,
      },
      data: updateData,
    });

    // Update tenant usage if notification was sent successfully
    if (status === 'SENT') {
      await this.updateTenantUsage(tenantId);
    }
  }

  private async updateTenantUsage(tenantId: string) {
    const today = new Date().toISOString().split('T')[0];

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        usage: {
          increment: {
            whatsapp_today: 1,
          },
        },
      },
    });
  }
}