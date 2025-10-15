import { ConfigService } from '@nestjs/config';
import { XenditProvider } from '../providers/xendit.provider';
import { MidtransProvider } from '../providers/midtrans.provider';
import { PaymentProvider, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
export interface PaymentGatewayRequest {
    amount: number;
    paymentMethod: PaymentMethod;
    provider: PaymentProvider;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    description: string;
    externalId?: string;
    callbackUrl?: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
}
export interface PaymentGatewayResponse {
    paymentUrl?: string;
    token?: string;
    redirectUrl?: string;
    externalId: string;
    status: string;
    provider: PaymentProvider;
}
export declare class PaymentGatewayService {
    private readonly xenditProvider;
    private readonly midtransProvider;
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(xenditProvider: XenditProvider, midtransProvider: MidtransProvider, configService: ConfigService, prisma: PrismaService);
    createPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
    private createXenditPayment;
    private createMidtransPayment;
    getPaymentStatus(externalId: string, provider: PaymentProvider): Promise<any>;
    cancelPayment(externalId: string, provider: PaymentProvider): Promise<any>;
    refundPayment(externalId: string, provider: PaymentProvider, amount?: number, reason?: string): Promise<any>;
    validateWebhook(provider: PaymentProvider, payload: any, signature: string): Promise<boolean>;
    processWebhook(provider: PaymentProvider, payload: any): Promise<any>;
    private processXenditWebhook;
    getAvailablePaymentMethods(): Promise<any[]>;
    private getXenditPaymentMethods;
    private mapXenditWebhookStatus;
    syncPaymentStatus(paymentId: string): Promise<void>;
    private updateInvoicePaidAmount;
    getProviderConfig(provider: PaymentProvider): Promise<any>;
}
