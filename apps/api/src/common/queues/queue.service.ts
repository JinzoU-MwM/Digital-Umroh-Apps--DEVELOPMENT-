import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailJobData } from './mail.processor';
import { NotificationJobData } from './notification.processor';

export interface ScheduleOptions {
  repeat?: {
    cron?: string;
    every?: number;
    limit?: number;
  };
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('mail') private readonly mailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('Queue service initialized');
  }

  // Mail Queue Methods
  async addEmailJob(data: MailJobData, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.mailQueue.add('send-email', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 2000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        repeat: options?.repeat,
      });

      this.logger.log(`Email job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add email job to queue:', error);
      throw error;
    }
  }

  async addOTPJob(data: { to: string; otp: string; name?: string; tenantId?: string }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.mailQueue.add('send-otp', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 1000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        priority: 10, // High priority for OTP
      });

      this.logger.log(`OTP job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add OTP job to queue:', error);
      throw error;
    }
  }

  async addBookingConfirmationJob(data: {
    to: string;
    bookingCode: string;
    packageName: string;
    customerName: string;
    totalAmount: number;
    departureDate: string;
    tenantId: string;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.mailQueue.add('send-booking-confirmation', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 2000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        priority: 5,
      });

      this.logger.log(`Booking confirmation job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add booking confirmation job to queue:', error);
      throw error;
    }
  }

  async addPaymentConfirmationJob(data: {
    to: string;
    paymentId: string;
    amount: number;
    paymentMethod: string;
    invoiceNumber?: string;
    tenantId: string;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.mailQueue.add('send-payment-confirmation', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 2000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        priority: 5,
      });

      this.logger.log(`Payment confirmation job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add payment confirmation job to queue:', error);
      throw error;
    }
  }

  async addInvoiceJob(data: {
    to: string;
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    customerName: string;
    tenantId: string;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.mailQueue.add('send-invoice', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 3000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
      });

      this.logger.log(`Invoice job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add invoice job to queue:', error);
      throw error;
    }
  }

  // Notification Queue Methods
  async addNotificationJob(data: NotificationJobData, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.notificationQueue.add('send-notification', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 2000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        priority: data.priority === 'high' ? 10 : data.priority === 'low' ? 1 : 5,
      });

      this.logger.log(`Notification job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add notification job to queue:', error);
      throw error;
    }
  }

  async addBookingReminderJob(data: {
    bookingId: string;
    customerEmail: string;
    customerPhone: string;
    departureDate: string;
    bookingCode: string;
    tenantId: string;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.notificationQueue.add('send-booking-reminder', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 5000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        repeat: options?.repeat,
        priority: 5,
      });

      this.logger.log(`Booking reminder job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add booking reminder job to queue:', error);
      throw error;
    }
  }

  async addPaymentReminderJob(data: {
    invoiceId: string;
    customerEmail: string;
    customerPhone: string;
    dueDate: string;
    amount: number;
    invoiceNumber: string;
    tenantId: string;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.notificationQueue.add('send-payment-reminder', data, {
        attempts: options?.attempts || 3,
        backoff: options?.backoff || { type: 'exponential', delay: 5000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        repeat: options?.repeat,
        priority: 6, // Higher priority for payment reminders
      });

      this.logger.log(`Payment reminder job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add payment reminder job to queue:', error);
      throw error;
    }
  }

  async addWebhookEventJob(data: {
    event: string;
    data: any;
    source: string;
    tenantId?: string;
    processed?: boolean;
  }, options?: ScheduleOptions): Promise<any> {
    try {
      const job = await this.notificationQueue.add('process-webhook-event', data, {
        attempts: options?.attempts || 5, // More attempts for webhooks
        backoff: options?.backoff || { type: 'exponential', delay: 1000 },
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: options?.removeOnFail !== false,
        delay: options?.delay,
        priority: 3,
      });

      this.logger.log(`Webhook event job added to queue (Job ID: ${job.id})`);
      return job;
    } catch (error) {
      this.logger.error('Failed to add webhook event job to queue:', error);
      throw error;
    }
  }

  // Queue Management Methods
  async getMailQueueStats(): Promise<any> {
    try {
      const waiting = await this.mailQueue.getWaiting();
      const active = await this.mailQueue.getActive();
      const completed = await this.mailQueue.getCompleted();
      const failed = await this.mailQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
      };
    } catch (error) {
      this.logger.error('Failed to get mail queue stats:', error);
      throw error;
    }
  }

  async getNotificationQueueStats(): Promise<any> {
    try {
      const waiting = await this.notificationQueue.getWaiting();
      const active = await this.notificationQueue.getActive();
      const completed = await this.notificationQueue.getCompleted();
      const failed = await this.notificationQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length,
      };
    } catch (error) {
      this.logger.error('Failed to get notification queue stats:', error);
      throw error;
    }
  }

  async getQueueStats(): Promise<any> {
    try {
      const [mailStats, notificationStats] = await Promise.all([
        this.getMailQueueStats(),
        this.getNotificationQueueStats(),
      ]);

      return {
        mail: mailStats,
        notification: notificationStats,
        total: {
          waiting: mailStats.waiting + notificationStats.waiting,
          active: mailStats.active + notificationStats.active,
          completed: mailStats.completed + notificationStats.completed,
          failed: mailStats.failed + notificationStats.failed,
          total: mailStats.total + notificationStats.total,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  async pauseQueue(queueName: 'mail' | 'notification'): Promise<void> {
    try {
      if (queueName === 'mail') {
        await this.mailQueue.pause();
      } else {
        await this.notificationQueue.pause();
      }
      this.logger.log(`${queueName} queue paused`);
    } catch (error) {
      this.logger.error(`Failed to pause ${queueName} queue:`, error);
      throw error;
    }
  }

  async resumeQueue(queueName: 'mail' | 'notification'): Promise<void> {
    try {
      if (queueName === 'mail') {
        await this.mailQueue.resume();
      } else {
        await this.notificationQueue.resume();
      }
      this.logger.log(`${queueName} queue resumed`);
    } catch (error) {
      this.logger.error(`Failed to resume ${queueName} queue:`, error);
      throw error;
    }
  }

  async clearQueue(queueName: 'mail' | 'notification'): Promise<void> {
    try {
      if (queueName === 'mail') {
        await this.mailQueue.clean(0, 'completed');
        await this.mailQueue.clean(0, 'failed');
      } else {
        await this.notificationQueue.clean(0, 'completed');
        await this.notificationQueue.clean(0, 'failed');
      }
      this.logger.log(`${queueName} queue cleared`);
    } catch (error) {
      this.logger.error(`Failed to clear ${queueName} queue:`, error);
      throw error;
    }
  }

  // Bulk Operations
  async addBulkEmailJobs(jobs: Array<{ data: MailJobData; options?: ScheduleOptions }>): Promise<any[]> {
    try {
      const results = await Promise.all(
        jobs.map(job => this.addEmailJob(job.data, job.options))
      );
      this.logger.log(`Bulk email jobs added to queue (${jobs.length} jobs)`);
      return results;
    } catch (error) {
      this.logger.error('Failed to add bulk email jobs to queue:', error);
      throw error;
    }
  }

  async addBulkNotificationJobs(jobs: Array<{ data: NotificationJobData; options?: ScheduleOptions }>): Promise<any[]> {
    try {
      const results = await Promise.all(
        jobs.map(job => this.addNotificationJob(job.data, job.options))
      );
      this.logger.log(`Bulk notification jobs added to queue (${jobs.length} jobs)`);
      return results;
    } catch (error) {
      this.logger.error('Failed to add bulk notification jobs to queue:', error);
      throw error;
    }
  }
}