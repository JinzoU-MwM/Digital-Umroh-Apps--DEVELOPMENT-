import { InvoiceStatus, PaymentMethod } from '@prisma/client';
export declare class InvoiceItemDto {
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax?: number;
}
export declare class CreateInvoiceDto {
    customer_id: string;
    booking_id?: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    notes?: string;
    billing_address?: string;
    billing_email?: string;
    billing_phone?: string;
    tax_rate?: number;
    discount_amount?: number;
    items: InvoiceItemDto[];
    payment_terms?: number;
    late_fee_percentage?: number;
    custom_fields?: Record<string, any>;
}
export declare class UpdateInvoiceDto {
    customer_id?: string;
    booking_id?: string;
    invoice_number?: string;
    issue_date?: string;
    due_date?: string;
    status?: InvoiceStatus;
    notes?: string;
    billing_address?: string;
    billing_email?: string;
    billing_phone?: string;
    tax_rate?: number;
    discount_amount?: number;
    items?: InvoiceItemDto[];
    payment_terms?: number;
    late_fee_percentage?: number;
    custom_fields?: Record<string, any>;
}
export declare class InvoiceQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: InvoiceStatus;
    customer_id?: string;
    booking_id?: string;
    date_from?: string;
    date_to?: string;
    due_date_from?: string;
    due_date_to?: string;
    overdue_status?: 'overdue' | 'due_soon' | 'on_time';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class PaymentDto {
    amount: number;
    method: PaymentMethod;
    reference_number?: string;
    notes?: string;
    payment_date?: string;
}
