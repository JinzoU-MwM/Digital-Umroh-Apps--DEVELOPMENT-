"use strict";
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = QueueService_1 = class QueueService {
    constructor(mailQueue, notificationQueue) {
        this.mailQueue = mailQueue;
        this.notificationQueue = notificationQueue;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    onModuleInit() {
        this.logger.log('Queue service initialized');
    }
    async addEmailJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add email job to queue:', error);
            throw error;
        }
    }
    async addOTPJob(data, options) {
        try {
            const job = await this.mailQueue.add('send-otp', data, {
                attempts: options?.attempts || 3,
                backoff: options?.backoff || { type: 'exponential', delay: 1000 },
                removeOnComplete: options?.removeOnComplete !== false,
                removeOnFail: options?.removeOnFail !== false,
                delay: options?.delay,
                priority: 10,
            });
            this.logger.log(`OTP job added to queue (Job ID: ${job.id})`);
            return job;
        }
        catch (error) {
            this.logger.error('Failed to add OTP job to queue:', error);
            throw error;
        }
    }
    async addBookingConfirmationJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add booking confirmation job to queue:', error);
            throw error;
        }
    }
    async addPaymentConfirmationJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add payment confirmation job to queue:', error);
            throw error;
        }
    }
    async addInvoiceJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add invoice job to queue:', error);
            throw error;
        }
    }
    async addNotificationJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add notification job to queue:', error);
            throw error;
        }
    }
    async addBookingReminderJob(data, options) {
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
        }
        catch (error) {
            this.logger.error('Failed to add booking reminder job to queue:', error);
            throw error;
        }
    }
    async addPaymentReminderJob(data, options) {
        try {
            const job = await this.notificationQueue.add('send-payment-reminder', data, {
                attempts: options?.attempts || 3,
                backoff: options?.backoff || { type: 'exponential', delay: 5000 },
                removeOnComplete: options?.removeOnComplete !== false,
                removeOnFail: options?.removeOnFail !== false,
                delay: options?.delay,
                repeat: options?.repeat,
                priority: 6,
            });
            this.logger.log(`Payment reminder job added to queue (Job ID: ${job.id})`);
            return job;
        }
        catch (error) {
            this.logger.error('Failed to add payment reminder job to queue:', error);
            throw error;
        }
    }
    async addWebhookEventJob(data, options) {
        try {
            const job = await this.notificationQueue.add('process-webhook-event', data, {
                attempts: options?.attempts || 5,
                backoff: options?.backoff || { type: 'exponential', delay: 1000 },
                removeOnComplete: options?.removeOnComplete !== false,
                removeOnFail: options?.removeOnFail !== false,
                delay: options?.delay,
                priority: 3,
            });
            this.logger.log(`Webhook event job added to queue (Job ID: ${job.id})`);
            return job;
        }
        catch (error) {
            this.logger.error('Failed to add webhook event job to queue:', error);
            throw error;
        }
    }
    async getMailQueueStats() {
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
        }
        catch (error) {
            this.logger.error('Failed to get mail queue stats:', error);
            throw error;
        }
    }
    async getNotificationQueueStats() {
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
        }
        catch (error) {
            this.logger.error('Failed to get notification queue stats:', error);
            throw error;
        }
    }
    async getQueueStats() {
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
        }
        catch (error) {
            this.logger.error('Failed to get queue stats:', error);
            throw error;
        }
    }
    async pauseQueue(queueName) {
        try {
            if (queueName === 'mail') {
                await this.mailQueue.pause();
            }
            else {
                await this.notificationQueue.pause();
            }
            this.logger.log(`${queueName} queue paused`);
        }
        catch (error) {
            this.logger.error(`Failed to pause ${queueName} queue:`, error);
            throw error;
        }
    }
    async resumeQueue(queueName) {
        try {
            if (queueName === 'mail') {
                await this.mailQueue.resume();
            }
            else {
                await this.notificationQueue.resume();
            }
            this.logger.log(`${queueName} queue resumed`);
        }
        catch (error) {
            this.logger.error(`Failed to resume ${queueName} queue:`, error);
            throw error;
        }
    }
    async clearQueue(queueName) {
        try {
            if (queueName === 'mail') {
                await this.mailQueue.clean(0, 'completed');
                await this.mailQueue.clean(0, 'failed');
            }
            else {
                await this.notificationQueue.clean(0, 'completed');
                await this.notificationQueue.clean(0, 'failed');
            }
            this.logger.log(`${queueName} queue cleared`);
        }
        catch (error) {
            this.logger.error(`Failed to clear ${queueName} queue:`, error);
            throw error;
        }
    }
    async addBulkEmailJobs(jobs) {
        try {
            const results = await Promise.all(jobs.map(job => this.addEmailJob(job.data, job.options)));
            this.logger.log(`Bulk email jobs added to queue (${jobs.length} jobs)`);
            return results;
        }
        catch (error) {
            this.logger.error('Failed to add bulk email jobs to queue:', error);
            throw error;
        }
    }
    async addBulkNotificationJobs(jobs) {
        try {
            const results = await Promise.all(jobs.map(job => this.addNotificationJob(job.data, job.options)));
            this.logger.log(`Bulk notification jobs added to queue (${jobs.length} jobs)`);
            return results;
        }
        catch (error) {
            this.logger.error('Failed to add bulk notification jobs to queue:', error);
            throw error;
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, bull_1.InjectQueue)('mail')),
    tslib_1.__param(1, (0, bull_1.InjectQueue)('notification')),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map