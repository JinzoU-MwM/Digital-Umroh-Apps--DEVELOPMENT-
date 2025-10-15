import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export interface MailJobData {
    to: string | string[];
    subject: string;
    template?: string;
    context?: any;
    html?: string;
    text?: string;
    from?: string;
    priority?: 'high' | 'normal' | 'low';
    tenantId?: string;
    userId?: string;
}
export declare class MailProcessor {
    private readonly mailerService;
    private readonly configService;
    private readonly logger;
    constructor(mailerService: MailerService, configService: ConfigService);
    handleSendEmail(job: Job<MailJobData>): Promise<{
        success: boolean;
        messageId: any;
        to: string | string[];
        subject: string;
        tenantId: string;
        userId: string;
    }>;
    handleSendOTP(job: Job<{
        to: string;
        otp: string;
        name?: string;
        tenantId?: string;
    }>): Promise<{
        success: boolean;
        messageId: any;
        to: string;
        purpose: string;
        tenantId: string;
    }>;
    handleBookingConfirmation(job: Job<{
        to: string;
        bookingCode: string;
        packageName: string;
        customerName: string;
        totalAmount: number;
        departureDate: string;
        tenantId: string;
    }>): Promise<{
        success: boolean;
        messageId: any;
        to: string;
        bookingCode: string;
        purpose: string;
        tenantId: string;
    }>;
    handlePaymentConfirmation(job: Job<{
        to: string;
        paymentId: string;
        amount: number;
        paymentMethod: string;
        invoiceNumber?: string;
        tenantId: string;
    }>): Promise<{
        success: boolean;
        messageId: any;
        to: string;
        paymentId: string;
        purpose: string;
        tenantId: string;
    }>;
    handleSendInvoice(job: Job<{
        to: string;
        invoiceNumber: string;
        totalAmount: number;
        dueDate: string;
        customerName: string;
        tenantId: string;
    }>): Promise<{
        success: boolean;
        messageId: any;
        to: string;
        invoiceNumber: string;
        purpose: string;
        tenantId: string;
    }>;
    private isTransientError;
}
