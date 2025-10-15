import { z } from 'zod';
import { BaseEntitySchema, MoneySchema } from './common';
import { RoomTypeSchema } from './package';

export const BookingStatusSchema = z.enum([
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PAID',
  'CANCELLED',
  'REFUNDED',
  'COMPLETED'
]);

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PARTIAL',
  'PAID',
  'OVERDUE',
  'FAILED'
]);

export const CreateBookingSchema = z.object({
  customer_id: z.string().uuid(),
  package_id: z.string().uuid(),
  room_type: RoomTypeSchema,
  number_of_pilgrims: z.number().int().min(1).max(10),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.object({
    dp_amount: MoneySchema,
    dp_due_date: z.string().datetime(),
    remaining_amount: MoneySchema,
    remaining_due_date: z.string().datetime(),
  }),
});

export const UpdateBookingSchema = CreateBookingSchema.partial().extend({
  id: z.string().uuid(),
});

export const BookingSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  package_id: z.string().uuid(),
  booking_code: z.string(),
  status: BookingStatusSchema,
  payment_status: PaymentStatusSchema,
  room_type: RoomTypeSchema,
  number_of_pilgrims: z.number().int().positive(),
  special_requests: z.string().nullable(),
  notes: z.string().nullable(),
  prices: z.object({
    base_price: MoneySchema,
    tax_amount: MoneySchema,
    additional_fees: MoneySchema,
    discount_amount: MoneySchema,
    total_price: MoneySchema,
  }),
  payments: z.object({
    dp_amount: MoneySchema,
    dp_paid: MoneySchema,
    remaining_amount: MoneySchema,
    remaining_paid: MoneySchema,
    total_paid: MoneySchema,
  }),
  important_dates: z.object({
    booking_date: z.string().datetime(),
    confirmation_date: z.string().datetime().nullable(),
    payment_complete_date: z.string().datetime().nullable(),
    departure_date: z.string().datetime(),
    return_date: z.string().datetime(),
  }),
  created_by: z.string().uuid(),
  updated_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingDto = z.infer<typeof UpdateBookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;