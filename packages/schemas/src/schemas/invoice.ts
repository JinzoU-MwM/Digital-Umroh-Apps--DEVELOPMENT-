import { z } from 'zod';
import { BaseEntitySchema, MoneySchema } from './common';

export const InvoiceStatusSchema = z.enum([
  'DRAFT',
  'SENT',
  'PAID',
  'PARTIALLY_PAID',
  'OVERDUE',
  'CANCELLED',
  'REFUNDED'
]);

export const CreateInvoiceSchema = z.object({
  booking_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  invoice_number: z.string(),
  issue_date: z.string().datetime(),
  due_date: z.string().datetime(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unit_price: MoneySchema,
    tax_percentage: z.number().min(0).max(100),
    discount_percentage: z.number().min(0).max(100).default(0),
  })),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const InvoiceSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  invoice_number: z.string(),
  status: InvoiceStatusSchema,
  issue_date: z.string().datetime(),
  due_date: z.string().datetime(),
  paid_date: z.string().datetime().nullable(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().int().positive(),
    unit_price: MoneySchema,
    tax_percentage: z.number().min(0).max(100),
    discount_percentage: z.number().min(0).max(100).default(0),
    total_price: MoneySchema,
  })),
  subtotal: MoneySchema,
  tax_amount: MoneySchema,
  discount_amount: MoneySchema,
  total_amount: MoneySchema,
  paid_amount: MoneySchema,
  remaining_amount: MoneySchema,
  notes: z.string().nullable(),
  terms: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;