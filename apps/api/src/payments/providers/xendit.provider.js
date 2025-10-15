"use strict";
var XenditProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XenditProvider = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Xendit = require("xendit-node");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
let XenditProvider = XenditProvider_1 = class XenditProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(XenditProvider_1.name);
        const secretKey = this.configService.get('XENDIT_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('Xendit secret key not configured');
        }
        this.xenditClient = new Xendit({
            secretKey: secretKey || '',
        });
    }
    getEwalletClient() {
        return this.xenditClient.EWallet;
    }
    getInvoiceClient() {
        return this.xenditClient.Invoice;
    }
    getVirtualAccountClient() {
        return this.xenditClient.VirtualAcc;
    }
    async createPayment(request) {
        const externalId = request.externalId || (0, uuid_1.v4)();
        try {
            switch (request.paymentMethod) {
                case client_1.PaymentMethod.EWALLET:
                    return await this.createEwalletPayment({ ...request, externalId });
                case client_1.PaymentMethod.VIRTUAL_ACCOUNT:
                    return await this.createVirtualAccountPayment({ ...request, externalId });
                case client_1.PaymentMethod.BANK_TRANSFER:
                    return await this.createBankTransferPayment({ ...request, externalId });
                case client_1.PaymentMethod.CREDIT_CARD:
                    return await this.createCreditCardPayment({ ...request, externalId });
                case client_1.PaymentMethod.QRIS:
                    return await this.createQRISPayment({ ...request, externalId });
                default:
                    return await this.createInvoicePayment({ ...request, externalId });
            }
        }
        catch (error) {
            this.logger.error('Xendit payment creation failed:', error);
            throw error;
        }
    }
    async createEwalletPayment(request) {
        const ewalletClient = this.getEwalletClient();
        const ewalletType = this.getEwalletType(request.paymentMethod);
        if (!ewalletType) {
            throw new Error(`Unsupported e-wallet method: ${request.paymentMethod}`);
        }
        const response = await ewalletClient.createEWalletCharge({
            referenceID: request.externalId,
            currency: 'IDR',
            amount: request.amount,
            checkoutMethod: ewalletType,
            channelProperties: {
                successRedirectURL: request.successRedirectUrl,
                failureRedirectURL: request.failureRedirectUrl,
            },
            customerDetails: {
                email: request.customerEmail,
                firstName: request.customerName.split(' ')[0],
                lastName: request.customerName.split(' ').slice(1).join(' ') || '',
            },
            basket: [
                {
                    referenceID: request.externalId,
                    name: request.description,
                    category: 'TRAVEL',
                    currency: 'IDR',
                    price: request.amount,
                    quantity: 1,
                },
            ],
        });
        return {
            paymentUrl: response.checkout_url,
            externalId: request.externalId,
            status: response.status,
        };
    }
    async createVirtualAccountPayment(request) {
        const vaClient = this.getVirtualAccountClient();
        const response = await vaClient.createFixedVirtualAccount({
            externalID: request.externalId,
            bankCode: this.getBankCode(request.paymentMethod),
            name: request.customerName,
            virtualAccountNumber: this.generateVANumber(),
            suggestedAmount: request.amount,
            description: request.description,
            isClosed: true,
            expectedAmt: request.amount,
        });
        return {
            externalId: request.externalId,
            status: 'PENDING',
        };
    }
    async createBankTransferPayment(request) {
        return await this.createVirtualAccountPayment(request);
    }
    async createCreditCardPayment(request) {
        return await this.createInvoicePayment(request);
    }
    async createQRISPayment(request) {
        const ewalletClient = this.getEwalletClient();
        const response = await ewalletClient.createEWalletCharge({
            referenceID: request.externalId,
            currency: 'IDR',
            amount: request.amount,
            checkoutMethod: 'QRIS',
            channelProperties: {
                qrContents: `Payment for ${request.description}`,
            },
            customerDetails: {
                email: request.customerEmail,
                firstName: request.customerName.split(' ')[0],
                lastName: request.customerName.split(' ').slice(1).join(' ') || '',
            },
        });
        return {
            paymentUrl: response.qr_string,
            externalId: request.externalId,
            status: response.status,
        };
    }
    async createInvoicePayment(request) {
        const invoiceClient = this.getInvoiceClient();
        const response = await invoiceClient.createInvoice({
            externalId: request.externalId,
            amount: request.amount,
            description: request.description,
            invoiceDuration: 86400,
            customer: {
                givenNames: request.customerName,
                email: request.customerEmail,
            },
            successRedirectURL: request.successRedirectUrl,
            failureRedirectURL: request.failureRedirectUrl,
            paymentMethods: this.getPaymentMethodsForInvoice(request.paymentMethod),
            fees: [
                {
                    type: 'ADMIN',
                    value: 5000,
                },
            ],
        });
        return {
            paymentUrl: response.invoice_url,
            externalId: request.externalId,
            status: response.status,
        };
    }
    async getPaymentStatus(externalId) {
        try {
            const invoiceClient = this.getInvoiceClient();
            const invoice = await invoiceClient.getInvoice({
                invoiceID: externalId,
            });
            return {
                status: this.mapXenditStatusToPaymentStatus(invoice.status),
                amount: invoice.amount,
                paidAmount: invoice.paidAmount,
                paymentDate: invoice.paidAt ? new Date(invoice.paidAt) : null,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Xendit payment status for ${externalId}:`, error);
            throw error;
        }
    }
    async validateWebhook(payload, signature) {
        try {
            const expectedToken = this.configService.get('XENDIT_CALLBACK_TOKEN');
            return signature === expectedToken;
        }
        catch (error) {
            this.logger.error('Xendit webhook validation failed:', error);
            return false;
        }
    }
    getEwalletType(method) {
        const ewalletMap = {
            [client_1.PaymentMethod.GOPAY]: 'GOPAY',
            [client_1.PaymentMethod.OVO]: 'OVO',
            [client_1.PaymentMethod.DANA]: 'DANA',
            [client_1.PaymentMethod.LINKAJA]: 'LINKAJA',
            [client_1.PaymentMethod.SHOPEEPAY]: 'SHOPEEPAY',
        };
        return ewalletMap[method] || null;
    }
    getBankCode(method) {
        const bankMap = {
            [client_1.PaymentMethod.VIRTUAL_ACCOUNT]: 'BCA',
            [client_1.PaymentMethod.BANK_TRANSFER]: 'BCA',
        };
        return bankMap[method] || 'BCA';
    }
    getPaymentMethodsForInvoice(method) {
        const methodMap = {
            [client_1.PaymentMethod.CREDIT_CARD]: ['CREDIT_CARD'],
            [client_1.PaymentMethod.BANK_TRANSFER]: ['VIRTUAL_ACCOUNT', 'BANK_TRANSFER'],
            [client_1.PaymentMethod.EWALLET]: ['EWALLET'],
            [client_1.PaymentMethod.QRIS]: ['QRIS'],
        };
        return methodMap[method] || ['VIRTUAL_ACCOUNT', 'EWALLET', 'QRIS'];
    }
    mapXenditStatusToPaymentStatus(xenditStatus) {
        const statusMap = {
            'PENDING': client_1.PaymentStatus.PENDING,
            'PAID': client_1.PaymentStatus.COMPLETED,
            'SETTLED': client_1.PaymentStatus.COMPLETED,
            'EXPIRED': client_1.PaymentStatus.EXPIRED,
            'FAILED': client_1.PaymentStatus.FAILED,
            'CANCELLED': client_1.PaymentStatus.CANCELLED,
        };
        return statusMap[xenditStatus] || client_1.PaymentStatus.PENDING;
    }
    generateVANumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `88${timestamp}${random}`.slice(0, 16);
    }
    isConfigured() {
        return !!this.configService.get('XENDIT_SECRET_KEY');
    }
};
exports.XenditProvider = XenditProvider;
exports.XenditProvider = XenditProvider = XenditProvider_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService])
], XenditProvider);
//# sourceMappingURL=xendit.provider.js.map