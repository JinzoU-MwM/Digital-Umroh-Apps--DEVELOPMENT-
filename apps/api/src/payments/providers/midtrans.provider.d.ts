import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@prisma/client';
export interface MidtransPaymentRequest {
    amount: number;
    paymentMethod: PaymentMethod;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    description: string;
    externalId?: string;
    callbackUrl?: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
}
export interface MidtransPaymentResponse {
    paymentUrl?: string;
    token?: string;
    redirectUrl?: string;
    externalId: string;
    status: string;
}
export declare class MidtransProvider {
    private readonly configService;
    private readonly logger;
    private readonly core;
    private readonly snap;
    private readonly isProduction;
    constructor(configService: ConfigService);
    createPayment(request: MidtransPaymentRequest): Promise<MidtransPaymentResponse>;
    getPaymentStatus(orderId: string): Promise<any>;
    cancelPayment(orderId: string): Promise<any>;
    refundPayment(orderId: string, amount?: number, reason?: string): Promise<any>;
    validateWebhook(payload: any, signature: string): Promise<boolean>;
    private createSignature;
    private getEnabledPayments;
    private mapMidtransStatusToPaymentStatus;
    getPaymentMethods(): Promise<any[]>;
    processNotification(notification: any): Promise<any>;
    isConfigured(): boolean;
    getClientKey(): string;
    isProductionMode(): boolean;
}
