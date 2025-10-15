import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export interface NotificationJobData {
    type: 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';
    recipient: string;
    message: string;
    subject?: string;
    data?: any;
    priority?: 'high' | 'normal' | 'low';
    tenantId?: string;
    userId?: string;
    entityId?: string;
    entityType?: string;
}
export declare class NotificationProcessor {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    handleSendNotification(job: Job<NotificationJobData>): Promise<any>;
    handleBookingReminder(job: Job<{
        bookingId: string;
        customerEmail: string;
        customerPhone: string;
        departureDate: string;
        bookingCode: string;
        tenantId: string;
    }>): Promise<{
        skipped: boolean;
        reason: string;
        success?: never;
        bookingId?: never;
        bookingCode?: never;
        daysUntilDeparture?: never;
        emailSent?: never;
        smsSent?: never;
    } | {
        success: boolean;
        bookingId: string;
        bookingCode: string;
        daysUntilDeparture: number;
        emailSent: boolean;
        smsSent: boolean;
        skipped?: never;
        reason?: never;
    }>;
    handlePaymentReminder(job: Job<{
        invoiceId: string;
        customerEmail: string;
        customerPhone: string;
        dueDate: string;
        amount: number;
        invoiceNumber: string;
        tenantId: string;
    }>): Promise<{
        skipped: boolean;
        reason: string;
        success?: never;
        invoiceId?: never;
        invoiceNumber?: never;
        daysUntilDue?: never;
        emailSent?: never;
        smsSent?: never;
    } | {
        success: boolean;
        invoiceId: string;
        invoiceNumber: string;
        daysUntilDue: number;
        emailSent: boolean;
        smsSent: boolean;
        skipped?: never;
        reason?: never;
    }>;
    handleWebhookEvent(job: Job<{
        event: string;
        data: any;
        source: string;
        tenantId?: string;
        processed: boolean;
    }>): Promise<{
        success: boolean;
        event: string;
        source: string;
        processed: boolean;
    }>;
    private sendSMS;
    private sendWhatsApp;
    private sendPushNotification;
    private queueEmailNotification;
    private processPaymentWebhook;
    private processNotificationWebhook;
    private logNotification;
    private isTransientError;
}
