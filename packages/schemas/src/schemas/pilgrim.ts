import { z } from 'zod';
import { BaseEntitySchema, PhoneSchema, FileUploadSchema } from './common';

export const PilgrimGenderSchema = z.enum(['MALE', 'FEMALE']);
export const DocumentStatusSchema = z.enum([
  'NOT_UPLOADED',
  'UPLOADED',
  'VERIFIED',
  'REJECTED',
  'EXPIRED'
]);

export const CreatePilgrimSchema = z.object({
  booking_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  birth_date: z.string().datetime(),
  birth_place: z.string(),
  gender: PilgrimGenderSchema,
  id_type: z.enum(['KTP', 'PASSPORT']),
  id_number: z.string(),
  passport_number: z.string().optional(),
  passport_expiry: z.string().datetime().optional(),
  family_relationship: z.string(),
  phone: PhoneSchema.optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergency_contact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: PhoneSchema,
  }).optional(),
});

export const PilgrimDocumentSchema = z.object({
  id: z.string().uuid(),
  pilgrim_id: z.string().uuid(),
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
  file_size: z.number().nonnegative(),
  mime_type: z.string(),
  status: DocumentStatusSchema,
  uploaded_at: z.string().datetime(),
  verified_at: z.string().datetime().nullable(),
  verified_by: z.string().uuid().nullable(),
  rejection_reason: z.string().nullable(),
  expiry_date: z.string().datetime().nullable(),
});

export const PilgrimSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  name: z.string(),
  birth_date: z.string().datetime(),
  birth_place: z.string(),
  gender: PilgrimGenderSchema,
  id_type: z.enum(['KTP', 'PASSPORT']),
  id_number: z.string(),
  passport_number: z.string().nullable(),
  passport_expiry: z.string().datetime().nullable(),
  family_relationship: z.string(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  emergency_contact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }).nullable(),
  room_assignment: z.object({
    room_number: z.string().nullable(),
    building: z.string().nullable(),
    floor: z.number().int().nullable(),
  }).nullable(),
  documents: z.array(PilgrimDocumentSchema),
  document_completion_percentage: z.number().min(0).max(100),
  status: z.enum(['REGISTERED', 'DOCUMENTS_PENDING', 'DOCUMENTS_COMPLETE', 'READY', 'DEPARTED', 'COMPLETED']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Pilgrim = z.infer<typeof PilgrimSchema>;
export type CreatePilgrimDto = z.infer<typeof CreatePilgrimSchema>;
export type PilgrimDocument = z.infer<typeof PilgrimDocumentSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;