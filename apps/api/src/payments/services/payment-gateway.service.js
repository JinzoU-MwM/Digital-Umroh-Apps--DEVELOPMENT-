"use strict";
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const xendit_provider_1 = require("../providers/xendit.provider");
const midtrans_provider_1 = require("../providers/midtrans.provider");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(xenditProvider, midtransProvider, configService, prisma) {
        this.xenditProvider = xenditProvider;
        this.midtransProvider = midtransProvider;
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
    }
    async createPayment(request) {
        this.logger.log(`Creating payment with ${request.provider} for amount ${request.amount}`);
        try {
            switch (request.provider) {
                case client_1.PaymentProvider.XENDIT:
                    return await this.createXenditPayment(request);
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.createMidtransPayment(request);
                default:
                    throw new common_1.BadRequestException(`Unsupported payment provider: ${request.provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Payment creation failed with ${request.provider}:`, error);
            throw error;
        }
    }
    async createXenditPayment(request) {
        if (!this.xenditProvider.isConfigured()) {
            throw new common_1.BadRequestException('Xendit is not configured');
        }
        const xenditRequest = {
            amount: request.amount,
            paymentMethod: request.paymentMethod,
            customerEmail: request.customerEmail,
            customerName: request.customerName,
            description: request.description,
            externalId: request.externalId,
            callbackUrl: request.callbackUrl,
            successRedirectUrl: request.successRedirectUrl,
            failureRedirectUrl: request.failureRedirectUrl,
        };
        const response = await this.xenditProvider.createPayment(xenditRequest);
        return {
            paymentUrl: response.paymentUrl,
            externalId: response.externalId,
            status: response.status,
            provider: client_1.PaymentProvider.XENDIT,
        };
    }
    async createMidtransPayment(request) {
        if (!this.midtransProvider.isConfigured()) {
            throw new common_1.BadRequestException('Midtrans is not configured');
        }
        const midtransRequest = {
            amount: request.amount,
            paymentMethod: request.paymentMethod,
            customerEmail: request.customerEmail,
            customerName: request.customerName,
            customerPhone: request.customerPhone,
            description: request.description,
            externalId: request.externalId,
            callbackUrl: request.callbackUrl,
            successRedirectUrl: request.successRedirectUrl,
            failureRedirectUrl: request.failureRedirectUrl,
        };
        const response = await this.midtransProvider.createPayment(midtransRequest);
        return {
            paymentUrl: response.paymentUrl,
            token: response.token,
            redirectUrl: response.redirectUrl,
            externalId: response.externalId,
            status: response.status,
            provider: client_1.PaymentProvider.MIDTRANS,
        };
    }
    async getPaymentStatus(externalId, provider) {
        try {
            switch (provider) {
                case client_1.PaymentProvider.XENDIT:
                    return await this.xenditProvider.getPaymentStatus(externalId);
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.midtransProvider.getPaymentStatus(externalId);
                default:
                    throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to get payment status for ${externalId} with ${provider}:`, error);
            throw error;
        }
    }
    async cancelPayment(externalId, provider) {
        try {
            switch (provider) {
                case client_1.PaymentProvider.XENDIT:
                    throw new common_1.BadRequestException('Cancellation not supported for Xendit');
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.midtransProvider.cancelPayment(externalId);
                default:
                    throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to cancel payment ${externalId} with ${provider}:`, error);
            throw error;
        }
    }
    async refundPayment(externalId, provider, amount, reason) {
        try {
            switch (provider) {
                case client_1.PaymentProvider.XENDIT:
                    throw new common_1.BadRequestException('Refund not supported for Xendit');
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.midtransProvider.refundPayment(externalId, amount, reason);
                default:
                    throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to refund payment ${externalId} with ${provider}:`, error);
            throw error;
        }
    }
    async validateWebhook(provider, payload, signature) {
        try {
            switch (provider) {
                case client_1.PaymentProvider.XENDIT:
                    return await this.xenditProvider.validateWebhook(payload, signature);
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.midtransProvider.validateWebhook(payload, signature);
                default:
                    return false;
            }
        }
        catch (error) {
            this.logger.error(`Webhook validation failed for ${provider}:`, error);
            return false;
        }
    }
    async processWebhook(provider, payload) {
        try {
            this.logger.log(`Processing webhook for ${provider}`);
            switch (provider) {
                case client_1.PaymentProvider.XENDIT:
                    return await this.processXenditWebhook(payload);
                case client_1.PaymentProvider.MIDTRANS:
                    return await this.midtransProvider.processNotification(payload);
                default:
                    throw new common_1.BadRequestException(`Unsupported payment provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Webhook processing failed for ${provider}:`, error);
            throw error;
        }
    }
    async processXenditWebhook(payload) {
        const externalId = payload.external_id || payload.id;
        const status = this.mapXenditWebhookStatus(payload.status);
        return {
            externalId,
            status,
            amount: payload.amount,
            paidAmount: payload.paid_amount,
            paymentDate: payload.paid_at ? new Date(payload.paid_at) : null,
            paymentMethod: payload.payment_method,
            rawWebhook: payload,
        };
    }
    async getAvailablePaymentMethods() {
        const allMethods = [
            {
                provider: client_1.PaymentProvider.XENDIT,
                methods: this.getXenditPaymentMethods(),
                configured: this.xenditProvider.isConfigured(),
            },
            {
                provider: client_1.PaymentProvider.MIDTRANS,
                methods: await this.midtransProvider.getPaymentMethods(),
                configured: this.midtransProvider.isConfigured(),
            },
        ];
        return allMethods.filter(provider => provider.configured);
    }
    getXenditPaymentMethods() {
        return [
            {
                code: 'CREDIT_CARD',
                name: 'Credit Card',
                description: 'Visa, Mastercard, JCB',
                category: 'CARD',
            },
            {
                code: 'VIRTUAL_ACCOUNT',
                name: 'Virtual Account',
                description: 'BCA, BNI, BRI, Mandiri',
                category: 'BANK_TRANSFER',
            },
            {
                code: 'EWALLET',
                name: 'E-Wallet',
                description: 'GoPay, OVO, DANA, LinkAja, ShopeePay',
                category: 'EWALLET',
            },
            {
                code: 'QRIS',
                name: 'QRIS',
                description: 'QR Code payment',
                category: 'QR',
            },
        ];
    }
    mapXenditWebhookStatus(status) {
        const statusMap = {
            'PENDING': client_1.PaymentStatus.PENDING,
            'PAID': client_1.PaymentStatus.COMPLETED,
            'SETTLED': client_1.PaymentStatus.COMPLETED,
            'EXPIRED': client_1.PaymentStatus.EXPIRED,
            'FAILED': client_1.PaymentStatus.FAILED,
            'CANCELLED': client_1.PaymentStatus.CANCELLED,
        };
        return statusMap[status] || client_1.PaymentStatus.PENDING;
    }
    async syncPaymentStatus(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (!payment.external_transaction_id || !payment.provider) {
            throw new common_1.BadRequestException('Payment does not have external transaction ID or provider');
        }
        try {
            const statusResponse = await this.getPaymentStatus(payment.external_transaction_id, payment.provider);
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: statusResponse.status,
                    metadata: {
                        ...payment.metadata,
                        last_sync: new Date().toISOString(),
                        provider_status: statusResponse,
                    },
                },
            });
            if (statusResponse.status === client_1.PaymentStatus.COMPLETED && payment.invoice_id) {
                await this.updateInvoicePaidAmount(payment.invoice_id);
            }
            this.logger.log(`Synced payment ${paymentId} status to ${statusResponse.status}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync payment ${paymentId}:`, error);
            throw error;
        }
    }
    async updateInvoicePaidAmount(invoiceId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                invoice_id: invoiceId,
                status: client_1.PaymentStatus.COMPLETED,
                deleted_at: null,
            },
        });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { paid_amount: totalPaid },
        });
    }
    async getProviderConfig(provider) {
        switch (provider) {
            case client_1.PaymentProvider.XENDIT:
                return {
                    configured: this.xenditProvider.isConfigured(),
                    environment: this.configService.get('XENDIT_ENVIRONMENT', 'sandbox'),
                };
            case client_1.PaymentProvider.MIDTRANS:
                return {
                    configured: this.midtransProvider.isConfigured(),
                    environment: this.midtransProvider.isProductionMode() ? 'production' : 'sandbox',
                    clientKey: this.midtransProvider.getClientKey(),
                };
            default:
                return {
                    configured: false,
                    environment: 'unknown',
                };
        }
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [xendit_provider_1.XenditProvider,
        midtrans_provider_1.MidtransProvider,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map