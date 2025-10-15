import { z } from 'zod';
import { BaseEntitySchema } from './common';

export const NotificationChannelSchema = z.enum([
  'WHATSAPP',
  'EMAIL',
  'SMS',
  'PUSH_NOTIFICATION',
  'IN_APP'
]);

export const NotificationTypeSchema = z.enum([
  'BOOKING_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',
  'DOCUMENT_REJECTED',
  'DEPARTURE_REMINDER',
  'ROOM_ASSIGNMENT',
  'FLIGHT_CHANGE',
  'GENERAL_ANNOUNCEMENT'
]);

export const CreateNotificationSchema = z.object({
  recipient_id: z.string().uuid(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  title: z.string(),
  content: z.string(),
  template_data: z.record(z.any()).optional(),
  scheduled_at: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

export const NotificationSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  title: z.string(),
  content: z.string(),
  template_data: z.record(z.any()).nullable(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED']),
  scheduled_at: z.string().datetime().nullable(),
  sent_at: z.string().datetime().nullable(),
  delivered_at: z.string().datetime().nullable(),
  failed_at: z.string().datetime().nullable(),
  failure_reason: z.string().nullable(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  external_id: z.string().nullable(),
  provider_response: z.any().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;