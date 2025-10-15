import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
export interface XenditPaymentRequest {
    amount: number;
    paymentMethod: PaymentMethod;
    customerEmail: string;
    customerName: string;
    description: string;
    externalId?: string;
    callbackUrl?: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
}
export interface XenditPaymentResponse {
    paymentUrl?: string;
    token?: string;
    externalId: string;
    status: string;
}
export declare class XenditProvider {
    private readonly configService;
    private readonly xenditClient;
    private readonly logger;
    constructor(configService: ConfigService);
    private getEwalletClient;
    private getInvoiceClient;
    private getVirtualAccountClient;
    createPayment(request: XenditPaymentRequest): Promise<XenditPaymentResponse>;
    private createEwalletPayment;
    private createVirtualAccountPayment;
    private createBankTransferPayment;
    private createCreditCardPayment;
    private createQRISPayment;
    private createInvoicePayment;
    getPaymentStatus(externalId: string): Promise<any>;
    validateWebhook(payload: any, signature: string): Promise<boolean>;
    private getEwalletType;
    private getBankCode;
    private getPaymentMethodsForInvoice;
    private mapXenditStatusToPaymentStatus;
    private generateVANumber;
    isConfigured(): boolean;
}
