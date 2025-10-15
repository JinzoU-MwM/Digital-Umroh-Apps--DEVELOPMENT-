"use strict";
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const tslib_1 = require("tslib");
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async handleSendNotification(job) {
        const { type, recipient, message, subject, data, priority, tenantId, userId, entityId, entityType } = job.data;
        this.logger.log(`Processing ${type} notification for ${recipient} (Job ID: ${job.id})`);
        try {
            let result = {
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
        }
        catch (error) {
            this.logger.error(`Failed to process ${type} notification for ${recipient}:`, error);
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
            if (job.attemptsMade < 3 && this.isTransientError(error)) {
                this.logger.log(`Retrying ${type} notification (attempt ${job.attemptsMade + 1}/3)`);
                throw error;
            }
            throw error;
        }
    }
    async handleBookingReminder(job) {
        const { bookingId, customerEmail, customerPhone, departureDate, bookingCode, tenantId } = job.data;
        this.logger.log(`Processing booking reminder for booking ${bookingId} (Job ID: ${job.id})`);
        try {
            const daysUntilDeparture = Math.ceil((new Date(departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDeparture <= 0) {
                this.logger.log(`Skipping reminder for past booking ${bookingId}`);
                return { skipped: true, reason: 'booking_date_passed' };
            }
            const message = `This is a reminder for your upcoming Digital Umroh booking ${bookingCode}. Your departure is in ${daysUntilDeparture} days on ${departureDate}. Please ensure all documents are ready and you have completed all payments.`;
            await this.queueEmailNotification({
                to: customerEmail,
                subject: `Booking Reminder - ${bookingCode}`,
                template: 'booking-reminder',
                context: {
                    bookingCode,
                    departureDate,
                    daysUntilDeparture,
                    customerName: 'Valued Customer',
                },
                tenantId,
            });
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
        }
        catch (error) {
            this.logger.error(`Failed to process booking reminder for booking ${bookingId}:`, error);
            throw error;
        }
    }
    async handlePaymentReminder(job) {
        const { invoiceId, customerEmail, customerPhone, dueDate, amount, invoiceNumber, tenantId } = job.data;
        this.logger.log(`Processing payment reminder for invoice ${invoiceId} (Job ID: ${job.id})`);
        try {
            const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilDue < 0) {
                this.logger.log(`Skipping reminder for overdue invoice ${invoiceId}`);
                return { skipped: true, reason: 'invoice_overdue' };
            }
            const message = `Payment reminder: Your Digital Umroh invoice ${invoiceNumber} for amount ${amount} is due in ${daysUntilDue} days on ${dueDate}. Please complete your payment to avoid any service interruption.`;
            await this.queueEmailNotification({
                to: customerEmail,
                subject: `Payment Reminder - Invoice ${invoiceNumber}`,
                template: 'payment-reminder',
                context: {
                    invoiceNumber,
                    amount,
                    dueDate,
                    daysUntilDue,
                    customerName: 'Valued Customer',
                },
                tenantId,
            });
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
        }
        catch (error) {
            this.logger.error(`Failed to process payment reminder for invoice ${invoiceId}:`, error);
            throw error;
        }
    }
    async handleWebhookEvent(job) {
        const { event, data, source, tenantId, processed } = job.data;
        this.logger.log(`Processing webhook event ${event} from ${source} (Job ID: ${job.id})`);
        try {
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
            if (source === 'payment' && event.includes('payment')) {
                await this.processPaymentWebhook(event, data, tenantId);
            }
            else if (source === 'notification' && event.includes('delivery')) {
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
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event ${event}:`, error);
            throw error;
        }
    }
    async sendSMS(recipient, message, tenantId) {
        this.logger.log(`Sending SMS to ${recipient}: ${message.substring(0, 50)}...`);
        return {
            success: true,
            type: 'SMS',
            recipient,
            messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cost: 0.05,
        };
    }
    async sendWhatsApp(recipient, message, data, tenantId) {
        this.logger.log(`Sending WhatsApp message to ${recipient}: ${message.substring(0, 50)}...`);
        return {
            success: true,
            type: 'WHATSAPP',
            recipient,
            messageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    async sendPushNotification(recipient, message, subject, data, tenantId, userId) {
        this.logger.log(`Sending push notification to ${recipient}: ${subject || message.substring(0, 50)}...`);
        return {
            success: true,
            type: 'PUSH',
            recipient,
            messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    async queueEmailNotification(emailData) {
        this.logger.log(`Queuing email notification to ${emailData.to}`);
    }
    async processPaymentWebhook(event, data, tenantId) {
        this.logger.log(`Processing payment webhook: ${event}`);
    }
    async processNotificationWebhook(event, data, tenantId) {
        this.logger.log(`Processing notification webhook: ${event}`);
    }
    async logNotification(notificationData) {
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
        }
        catch (error) {
            this.logger.error('Failed to log notification to database:', error);
        }
    }
    isTransientError(error) {
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
        return (transientErrorCodes.includes(errorCode) ||
            transientErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase())));
    }
};
exports.NotificationProcessor = NotificationProcessor;
tslib_1.__decorate([
    (0, bull_1.Process)('send-notification'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleSendNotification", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-booking-reminder'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleBookingReminder", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-payment-reminder'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handlePaymentReminder", null);
tslib_1.__decorate([
    (0, bull_1.Process)('process-webhook-event'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "handleWebhookEvent", null);
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = tslib_1.__decorate([
    (0, bull_1.Processor)('notification'),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map