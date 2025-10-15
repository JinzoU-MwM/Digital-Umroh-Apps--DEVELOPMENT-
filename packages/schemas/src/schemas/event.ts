import { z } from 'zod';
import { UUIDSchema } from './common';

export const EventActorSchema = z.object({
  user_id: UUIDSchema.optional(),
  system: z.boolean().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export const BaseEventSchema = z.object({
  id: UUIDSchema,
  tenant_id: UUIDSchema,
  type: z.string(),
  occurred_at: z.string().datetime(),
  actor: EventActorSchema,
  data: z.any(),
  metadata: z.record(z.any()).optional(),
  version: z.number().int().positive().default(1),
});

export const BookingCreatedEventSchema = BaseEventSchema.extend({
  type: z.literal('booking.created'),
  data: z.object({
    booking_id: UUIDSchema,
    customer_id: UUIDSchema,
    package_id: UUIDSchema,
    room_type: z.enum(['QUAD', 'TRIPLE', 'DOUBLE', 'SINGLE']),
    total_price: z.object({
      amount: z.number(),
      currency: z.string(),
    }),
  }),
});

export const InvoicePaidEventSchema = BaseEventSchema.extend({
  type: z.literal('invoice.paid'),
  data: z.object({
    invoice_id: UUIDSchema,
    booking_id: UUIDSchema,
    amount: z.object({
      amount: z.number(),
      currency: z.string(),
    }),
    payment_method: z.enum(['BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'E_WALLET', 'CREDIT_CARD', 'CASH']),
    provider: z.enum(['XENDIT', 'MIDTRANS', 'MANUAL']),
  }),
});

export const DocumentUploadedEventSchema = BaseEventSchema.extend({
  type: z.literal('document.uploaded'),
  data: z.object({
    pilgrim_id: UUIDSchema,
    document_type: z.enum([
      'PASSPORT',
      'KTP',
      'PHOTO_4X6',
      'BIRTH_CERTIFICATE',
      'MARRIAGE_CERTIFICATE',
      'FAMILY_CARD',
      'VISA',
      'TICKET',
      'HOTEL_VOUCHER',
      'INSURANCE',
      'OTHER'
    ]),
    filename: z.string(),
    file_url: z.string().url(),
  }),
});

export const PaymentWebhookEventSchema = BaseEventSchema.extend({
  type: z.literal('payment.webhook'),
  data: z.object({
    provider: z.enum(['XENDIT', 'MIDTRANS']),
    external_id: z.string(),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED']),
    amount: z.object({
      amount: z.number(),
      currency: z.string(),
    }),
    payment_method: z.string(),
    paid_at: z.string().datetime().optional(),
    raw_payload: z.any(),
  }),
});

export const TripRoomingCompletedEventSchema = BaseEventSchema.extend({
  type: z.literal('trip.rooming.completed'),
  data: z.object({
    trip_id: UUIDSchema,
    total_rooms: z.number().int().positive(),
    room_assignments: z.array(z.object({
      room_number: z.string(),
      pilgrim_ids: z.array(UUIDSchema),
      building: z.string().optional(),
      floor: z.number().int().optional(),
    })),
  }),
});

export const UmrahEventSchema = z.discriminatedUnion('type', [
  BookingCreatedEventSchema,
  InvoicePaidEventSchema,
  DocumentUploadedEventSchema,
  PaymentWebhookEventSchema,
  TripRoomingCompletedEventSchema,
]);

export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type EventActor = z.infer<typeof EventActorSchema>;
export type BookingCreatedEvent = z.infer<typeof BookingCreatedEventSchema>;
export type InvoicePaidEvent = z.infer<typeof InvoicePaidEventSchema>;
export type DocumentUploadedEvent = z.infer<typeof DocumentUploadedEventSchema>;
export type PaymentWebhookEvent = z.infer<typeof PaymentWebhookEventSchema>;
export type TripRoomingCompletedEvent = z.infer<typeof TripRoomingCompletedEventSchema>;
export type UmrahEvent = z.infer<typeof UmrahEventSchema>;