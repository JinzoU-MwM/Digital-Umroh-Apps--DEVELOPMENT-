import { z } from 'zod';
import { BaseEntitySchema, MoneySchema } from './common';

export const PaymentMethodSchema = z.enum([
  'BANK_TRANSFER',
  'VIRTUAL_ACCOUNT',
  'E_WALLET',
  'CREDIT_CARD',
  'CASH'
]);

export const PaymentProviderSchema = z.enum([
  'XENDIT',
  'MIDTRANS',
  'MANUAL'
]);

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'REFUNDED'
]);

export const CreatePaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: MoneySchema,
  method: PaymentMethodSchema,
  provider: PaymentProviderSchema,
  provider_reference: z.string().optional(),
  notes: z.string().optional(),
});

export const PaymentSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  amount: MoneySchema,
  method: PaymentMethodSchema,
  provider: PaymentProviderSchema,
  provider_reference: z.string().nullable(),
  status: PaymentStatusSchema,
  paid_at: z.string().datetime().nullable(),
  provider_response: z.any().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;