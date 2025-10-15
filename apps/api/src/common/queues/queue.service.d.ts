import { OnModuleInit } from '@nestjs/common';
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
export declare class QueueService implements OnModuleInit {
    private readonly mailQueue;
    private readonly notificationQueue;
    private readonly logger;
    constructor(mailQueue: Queue, notificationQueue: Queue);
    onModuleInit(): void;
    addEmailJob(data: MailJobData, options?: ScheduleOptions): Promise<any>;
    addOTPJob(data: {
        to: string;
        otp: string;
        name?: string;
        tenantId?: string;
    }, options?: ScheduleOptions): Promise<any>;
    addBookingConfirmationJob(data: {
        to: string;
        bookingCode: string;
        packageName: string;
        customerName: string;
        totalAmount: number;
        departureDate: string;
        tenantId: string;
    }, options?: ScheduleOptions): Promise<any>;
    addPaymentConfirmationJob(data: {
        to: string;
        paymentId: string;
        amount: number;
        paymentMethod: string;
        invoiceNumber?: string;
        tenantId: string;
    }, options?: ScheduleOptions): Promise<any>;
    addInvoiceJob(data: {
        to: string;
        invoiceNumber: string;
        totalAmount: number;
        dueDate: string;
        customerName: string;
        tenantId: string;
    }, options?: ScheduleOptions): Promise<any>;
    addNotificationJob(data: NotificationJobData, options?: ScheduleOptions): Promise<any>;
    addBookingReminderJob(data: {
        bookingId: string;
        customerEmail: string;
        customerPhone: string;
        departureDate: string;
        bookingCode: string;
        tenantId: string;
    }, options?: ScheduleOptions): Promise<any>;
    addPaymentReminderJob(data: {
        invoiceId: string;
        customerEmail: string;
        customerPhone: string;
        dueDate: string;
        amount: number;
        invoiceNumber: string;
        tenantId: string;
    }, options?: ScheduleOptions): Promise<any>;
    addWebhookEventJob(data: {
        event: string;
        data: any;
        source: string;
        tenantId?: string;
        processed?: boolean;
    }, options?: ScheduleOptions): Promise<any>;
    getMailQueueStats(): Promise<any>;
    getNotificationQueueStats(): Promise<any>;
    getQueueStats(): Promise<any>;
    pauseQueue(queueName: 'mail' | 'notification'): Promise<void>;
    resumeQueue(queueName: 'mail' | 'notification'): Promise<void>;
    clearQueue(queueName: 'mail' | 'notification'): Promise<void>;
    addBulkEmailJobs(jobs: Array<{
        data: MailJobData;
        options?: ScheduleOptions;
    }>): Promise<any[]>;
    addBulkNotificationJobs(jobs: Array<{
        data: NotificationJobData;
        options?: ScheduleOptions;
    }>): Promise<any[]>;
}
