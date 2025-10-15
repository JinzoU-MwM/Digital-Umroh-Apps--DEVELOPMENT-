"use strict";
var MidtransProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidtransProvider = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Midtrans = require("midtrans-client");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
let MidtransProvider = MidtransProvider_1 = class MidtransProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MidtransProvider_1.name);
        const serverKey = this.configService.get('MIDTRANS_SERVER_KEY');
        const clientKey = this.configService.get('MIDTRANS_CLIENT_KEY');
        this.isProduction = this.configService.get('NODE_ENV') === 'production';
        if (!serverKey) {
            this.logger.warn('Midtrans server key not configured');
        }
        this.core = new Midtrans.CoreApi({
            isProduction: this.isProduction,
            serverKey: serverKey || '',
            clientKey: clientKey || '',
        });
        this.snap = new Midtrans.Snap({
            isProduction: this.isProduction,
            serverKey: serverKey || '',
            clientKey: clientKey || '',
        });
    }
    async createPayment(request) {
        const externalId = request.externalId || (0, uuid_1.v4)();
        try {
            const parameter = {
                transaction_details: {
                    order_id: externalId,
                    gross_amount: request.amount,
                },
                customer_details: {
                    first_name: request.customerName.split(' ')[0],
                    last_name: request.customerName.split(' ').slice(1).join(' ') || '',
                    email: request.customerEmail,
                    phone: request.customerPhone,
                },
                item_details: [
                    {
                        id: externalId,
                        price: request.amount,
                        quantity: 1,
                        name: request.description,
                        category: 'TRAVEL',
                    },
                ],
                enabled_payments: this.getEnabledPayments(request.paymentMethod),
                callbacks: {
                    finish: request.successRedirectUrl,
                    unfocus: request.failureRedirectUrl,
                    error: request.failureRedirectUrl,
                    pending: request.callbackUrl,
                },
                expiry: {
                    unit: 'hours',
                    duration: 24,
                },
                custom_field1: 'DIGITAL_UMROH',
                custom_field2: request.paymentMethod,
            };
            const transaction = await this.snap.createTransaction(parameter);
            return {
                paymentUrl: transaction.redirect_url,
                token: transaction.token,
                externalId,
                status: 'PENDING',
            };
        }
        catch (error) {
            this.logger.error('Midtrans payment creation failed:', error);
            throw error;
        }
    }
    async getPaymentStatus(orderId) {
        try {
            const statusResponse = await this.core.transaction.status(orderId);
            return {
                status: this.mapMidtransStatusToPaymentStatus(statusResponse.transaction_status),
                amount: statusResponse.gross_amount,
                paidAmount: statusResponse.settlement_amount || statusResponse.gross_amount,
                paymentDate: statusResponse.settlement_time ? new Date(statusResponse.settlement_time) : null,
                fraudStatus: statusResponse.fraud_status,
                paymentType: statusResponse.payment_type,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Midtrans payment status for ${orderId}:`, error);
            throw error;
        }
    }
    async cancelPayment(orderId) {
        try {
            const response = await this.core.transaction.cancel(orderId);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to cancel Midtrans payment ${orderId}:`, error);
            throw error;
        }
    }
    async refundPayment(orderId, amount, reason) {
        try {
            const parameter = {
                order_id: orderId,
            };
            if (amount) {
                parameter.amount = amount;
            }
            if (reason) {
                parameter.reason = reason;
            }
            const response = await this.core.transaction.refund(parameter);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to refund Midtrans payment ${orderId}:`, error);
            throw error;
        }
    }
    async validateWebhook(payload, signature) {
        try {
            const serverKey = this.configService.get('MIDTRANS_SERVER_KEY');
            const expectedSignature = this.createSignature(payload.order_id, payload.status_code, payload.gross_amount, serverKey);
            return signature === expectedSignature;
        }
        catch (error) {
            this.logger.error('Midtrans webhook validation failed:', error);
            return false;
        }
    }
    createSignature(orderId, statusCode, grossAmount, serverKey) {
        const crypto = require('crypto');
        const input = `${orderId}${statusCode}${grossAmount}${serverKey}`;
        return crypto.createHash('sha512').update(input).digest('hex');
    }
    getEnabledPayments(method) {
        const paymentMap = {
            [client_1.PaymentMethod.CREDIT_CARD]: ['credit_card'],
            [client_1.PaymentMethod.BANK_TRANSFER]: ['bank_transfer'],
            [client_1.PaymentMethod.EWALLET]: [
                'gopay',
                'ovo',
                'dana',
                'linkaja',
                'shopeepay'
            ],
            [client_1.PaymentMethod.QRIS]: ['gopay', 'shopeepay'],
            [client_1.PaymentMethod.VIRTUAL_ACCOUNT]: [
                'echannel',
                'bca_klikbca',
                'bca_klikpay',
                'bri_epay',
                'cimb_clicks',
                'bca_va',
                'bri_va',
                'bni_va',
                'cimb_va',
                'mandiri_va',
                'permata_va'
            ],
            [client_1.PaymentMethod.CONVENIENCE_STORE]: ['indomaret', 'alfamart'],
            [client_1.PaymentMethod.CASH]: ['cstore'],
        };
        return paymentMap[method] || ['credit_card', 'bank_transfer', 'echannel'];
    }
    mapMidtransStatusToPaymentStatus(midtransStatus) {
        const statusMap = {
            'capture': client_1.PaymentStatus.COMPLETED,
            'settlement': client_1.PaymentStatus.COMPLETED,
            'pending': client_1.PaymentStatus.PENDING,
            'deny': client_1.PaymentStatus.FAILED,
            'cancel': client_1.PaymentStatus.CANCELLED,
            'expire': client_1.PaymentStatus.EXPIRED,
            'refund': client_1.PaymentStatus.REFUNDED,
            'partial_refund': client_1.PaymentStatus.REFUNDED,
            'authorize': client_1.PaymentStatus.PENDING,
        };
        return statusMap[midtransStatus] || client_1.PaymentStatus.PENDING;
    }
    async getPaymentMethods() {
        return [
            {
                code: 'credit_card',
                name: 'Credit/Debit Card',
                description: 'Visa, Mastercard, JCB, Amex',
                category: 'CARD',
            },
            {
                code: 'bank_transfer',
                name: 'Bank Transfer',
                description: 'Virtual Account via major banks',
                category: 'BANK_TRANSFER',
            },
            {
                code: 'echannel',
                name: 'Mandiri Bill',
                description: 'Mandiri online banking',
                category: 'BANK_TRANSFER',
            },
            {
                code: 'gopay',
                name: 'GoPay',
                description: 'GoPay e-wallet',
                category: 'EWALLET',
            },
            {
                code: 'ovo',
                name: 'OVO',
                description: 'OVO e-wallet',
                category: 'EWALLET',
            },
            {
                code: 'dana',
                name: 'DANA',
                description: 'DANA e-wallet',
                category: 'EWALLET',
            },
            {
                code: 'shopeepay',
                name: 'ShopeePay',
                description: 'ShopeePay e-wallet',
                category: 'EWALLET',
            },
            {
                code: 'indomaret',
                name: 'Indomaret',
                description: 'Cash payment at Indomaret stores',
                category: 'CSTORE',
            },
            {
                code: 'alfamart',
                name: 'Alfamart',
                description: 'Cash payment at Alfamart stores',
                category: 'CSTORE',
            },
        ];
    }
    async processNotification(notification) {
        try {
            const orderId = notification.order_id;
            const statusResponse = await this.getPaymentStatus(orderId);
            return {
                externalId: orderId,
                status: statusResponse.status,
                amount: statusResponse.amount,
                paidAmount: statusResponse.paidAmount,
                paymentDate: statusResponse.paymentDate,
                paymentMethod: statusResponse.paymentType,
                fraudStatus: statusResponse.fraudStatus,
                rawNotification: notification,
            };
        }
        catch (error) {
            this.logger.error('Failed to process Midtrans notification:', error);
            throw error;
        }
    }
    isConfigured() {
        return !!this.configService.get('MIDTRANS_SERVER_KEY');
    }
    getClientKey() {
        return this.configService.get('MIDTRANS_CLIENT_KEY') || '';
    }
    isProductionMode() {
        return this.isProduction;
    }
};
exports.MidtransProvider = MidtransProvider;
exports.MidtransProvider = MidtransProvider = MidtransProvider_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService])
], MidtransProvider);
//# sourceMappingURL=midtrans.provider.js.map