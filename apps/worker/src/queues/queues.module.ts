import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NOTIFICATION_QUEUE, EMAIL_QUEUE, REPORT_QUEUE, PAYMENT_QUEUE } from './queue.constants';

@Module({
  imports: [
    // Notification queue for WhatsApp, SMS, push notifications
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),

    // Email queue for transactional emails
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),

    // Report generation queue (CSV, XLSX, PDF)
    BullModule.registerQueue({
      name: REPORT_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),

    // Payment processing and reconciliation queue
    BullModule.registerQueue({
      name: PAYMENT_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),
  ],
})
export class QueuesModule {}