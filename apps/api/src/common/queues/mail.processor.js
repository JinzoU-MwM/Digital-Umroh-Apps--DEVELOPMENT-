"use strict";
var MailProcessor_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailProcessor = void 0;
const tslib_1 = require("tslib");
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let MailProcessor = MailProcessor_1 = class MailProcessor {
    constructor(mailerService, configService) {
        this.mailerService = mailerService;
        this.configService = configService;
        this.logger = new common_1.Logger(MailProcessor_1.name);
    }
    async handleSendEmail(job) {
        const { to, subject, template, context, html, text, from, priority, tenantId, userId } = job.data;
        this.logger.log(`Processing email job for ${to} (Job ID: ${job.id})`);
        try {
            const defaultFrom = from || this.configService.get('EMAIL_FROM', 'noreply@digital-umroh.com');
            let emailOptions = {
                to,
                from: defaultFrom,
                subject,
            };
            if (html) {
                emailOptions.html = html;
            }
            else if (template && context) {
                emailOptions.template = template;
                emailOptions.context = context;
            }
            if (text) {
                emailOptions.text = text;
            }
            if (tenantId) {
                emailOptions.headers = {
                    'X-Tenant-ID': tenantId,
                    'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
                };
            }
            const result = await this.mailerService.sendMail(emailOptions);
            this.logger.log(`Email sent successfully to ${to} (Message ID: ${result.messageId})`);
            job.progress(100);
            return {
                success: true,
                messageId: result.messageId,
                to,
                subject,
                tenantId,
                userId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            if (job.attemptsMade < 3 && this.isTransientError(error)) {
                this.logger.log(`Retrying email job (attempt ${job.attemptsMade + 1}/3)`);
                throw error;
            }
            throw error;
        }
    }
    async handleSendOTP(job) {
        const { to, otp, name, tenantId } = job.data;
        this.logger.log(`Processing OTP email for ${to} (Job ID: ${job.id})`);
        try {
            const emailOptions = {
                to,
                from: this.configService.get('EMAIL_FROM', 'noreply@digital-umroh.com'),
                subject: 'Your Digital Umroh Verification Code',
                template: 'otp',
                context: {
                    name: name || 'User',
                    otp,
                    companyName: 'Digital Umroh',
                    supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@digital-umroh.com'),
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
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}:`, error);
            throw error;
        }
    }
    async handleBookingConfirmation(job) {
        const { to, bookingCode, packageName, customerName, totalAmount, departureDate, tenantId } = job.data;
        this.logger.log(`Processing booking confirmation email for ${to} (Job ID: ${job.id})`);
        try {
            const emailOptions = {
                to,
                from: this.configService.get('EMAIL_FROM', 'noreply@digital-umroh.com'),
                subject: `Booking Confirmation - ${bookingCode}`,
                template: 'booking-confirmation',
                context: {
                    customerName,
                    bookingCode,
                    packageName,
                    totalAmount,
                    departureDate,
                    companyName: 'Digital Umroh',
                    supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@digital-umroh.com'),
                    websiteUrl: this.configService.get('FRONTEND_URL', 'https://digital-umroh.com'),
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
        }
        catch (error) {
            this.logger.error(`Failed to send booking confirmation email to ${to}:`, error);
            throw error;
        }
    }
    async handlePaymentConfirmation(job) {
        const { to, paymentId, amount, paymentMethod, invoiceNumber, tenantId } = job.data;
        this.logger.log(`Processing payment confirmation email for ${to} (Job ID: ${job.id})`);
        try {
            const emailOptions = {
                to,
                from: this.configService.get('EMAIL_FROM', 'noreply@digital-umroh.com'),
                subject: `Payment Confirmation - ${invoiceNumber || paymentId}`,
                template: 'payment-confirmation',
                context: {
                    paymentId,
                    invoiceNumber,
                    amount,
                    paymentMethod,
                    companyName: 'Digital Umroh',
                    supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@digital-umroh.com'),
                    websiteUrl: this.configService.get('FRONTEND_URL', 'https://digital-umroh.com'),
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
        }
        catch (error) {
            this.logger.error(`Failed to send payment confirmation email to ${to}:`, error);
            throw error;
        }
    }
    async handleSendInvoice(job) {
        const { to, invoiceNumber, totalAmount, dueDate, customerName, tenantId } = job.data;
        this.logger.log(`Processing invoice email for ${to} (Job ID: ${job.id})`);
        try {
            const emailOptions = {
                to,
                from: this.configService.get('EMAIL_FROM', 'noreply@digital-umroh.com'),
                subject: `Invoice ${invoiceNumber}`,
                template: 'invoice',
                context: {
                    invoiceNumber,
                    customerName,
                    totalAmount,
                    dueDate,
                    companyName: 'Digital Umroh',
                    supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@digital-umroh.com'),
                    websiteUrl: this.configService.get('FRONTEND_URL', 'https://digital-umroh.com'),
                },
                headers: {
                    'X-Tenant-ID': tenantId,
                    'X-Purpose': 'invoice-notification',
                    'X-Invoice-Number': invoiceNumber,
                },
                attachments: [
                    {
                        filename: `invoice-${invoiceNumber}.pdf`,
                        content: Buffer.from(''),
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
        }
        catch (error) {
            this.logger.error(`Failed to send invoice email to ${to}:`, error);
            throw error;
        }
    }
    isTransientError(error) {
        const transientErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
        const transientErrorMessages = [
            'Connection timeout',
            'Connection reset',
            'Temporary failure',
            'Service unavailable',
        ];
        const errorMessage = error.message || '';
        const errorCode = error.code || '';
        return (transientErrorCodes.includes(errorCode) ||
            transientErrorMessages.some(msg => errorMessage.toLowerCase().includes(msg.toLowerCase())));
    }
};
exports.MailProcessor = MailProcessor;
tslib_1.__decorate([
    (0, bull_1.Process)('send-email'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MailProcessor.prototype, "handleSendEmail", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-otp'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MailProcessor.prototype, "handleSendOTP", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-booking-confirmation'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MailProcessor.prototype, "handleBookingConfirmation", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-payment-confirmation'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MailProcessor.prototype, "handlePaymentConfirmation", null);
tslib_1.__decorate([
    (0, bull_1.Process)('send-invoice'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MailProcessor.prototype, "handleSendInvoice", null);
exports.MailProcessor = MailProcessor = MailProcessor_1 = tslib_1.__decorate([
    (0, bull_1.Processor)('mail'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mailer_1.MailerService !== "undefined" && mailer_1.MailerService) === "function" ? _a : Object, config_1.ConfigService])
], MailProcessor);
//# sourceMappingURL=mail.processor.js.map