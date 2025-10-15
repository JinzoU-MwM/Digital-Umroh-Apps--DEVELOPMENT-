import { z } from 'zod';
import { BaseEntitySchema, PhoneSchema, EmailSchema, AddressSchema } from './common';

export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: EmailSchema.optional(),
  phone: PhoneSchema,
  address: AddressSchema.optional(),
  id_type: z.enum(['KTP', 'PASSPORT', 'SIM']),
  id_number: z.string(),
  birth_date: z.string().datetime(),
  gender: z.enum(['MALE', 'FEMALE']),
  nationality: z.string().default('Indonesia'),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const CustomerSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string(),
  address: AddressSchema.nullable(),
  id_type: z.enum(['KTP', 'PASSPORT', 'SIM']),
  id_number: z.string(),
  birth_date: z.string().datetime(),
  gender: z.enum(['MALE', 'FEMALE']),
  nationality: z.string(),
  company: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;