import { PaymentStatus, PaymentMethod, PaymentProvider } from '@prisma/client';
export declare class CreatePaymentDto {
    customer_id: string;
    booking_id?: string;
    invoice_id?: string;
    amount: number;
    method: PaymentMethod;
    provider?: PaymentProvider;
    external_transaction_id?: string;
    reference_number?: string;
    description?: string;
    notes?: string;
    payment_date?: string;
    currency?: string;
    exchange_rate?: number;
    metadata?: Record<string, any>;
}
export declare class UpdatePaymentDto {
    status?: PaymentStatus;
    method?: PaymentMethod;
    provider?: PaymentProvider;
    external_transaction_id?: string;
    reference_number?: string;
    description?: string;
    notes?: string;
    payment_date?: string;
    currency?: string;
    exchange_rate?: number;
    metadata?: Record<string, any>;
}
export declare class PaymentQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    provider?: PaymentProvider;
    customer_id?: string;
    booking_id?: string;
    invoice_id?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number;
    amount_max?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class RefundPaymentDto {
    amount: number;
    reason: string;
    notes?: string;
    external_refund_id?: string;
}
export declare class PaymentWebhookDto {
    provider: PaymentProvider;
    event_type: string;
    payment_id?: string;
    external_transaction_id: string;
    status: PaymentStatus;
    amount?: number;
    data?: Record<string, any>;
}
