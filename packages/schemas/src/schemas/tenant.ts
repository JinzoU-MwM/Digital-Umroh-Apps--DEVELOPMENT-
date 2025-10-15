import { z } from 'zod';
import { BaseEntitySchema, AddressSchema, UrlSchema } from './common';

export const TenantStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL']);

export const TenantPlanSchema = z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']);

export const TenantSettingsSchema = z.object({
  tax_percentage: z.number().min(0).max(100).default(11),
  invoice_number_format: z.string().default('INV-{YYYYMM}-{sequence:4}'),
  whatsapp_limit_per_minute: z.number().int().positive().default(10),
  storage_limit_mb: z.number().int().positive().default(1000),
  enable_auto_rooming: z.boolean().default(false),
  enable_multi_airline_manifest: z.boolean().default(false),
  theme_brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1e40af'),
  theme_logo_url: UrlSchema.optional(),
  custom_domain: z.string().optional(),
  feature_flags: z.record(z.boolean()).default({}),
});

export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  domain: z.string().optional(),
  plan: TenantPlanSchema.default('STARTER'),
  status: TenantStatusSchema.default('TRIAL'),
  settings: TenantSettingsSchema.optional(),
  contact_email: z.string().email(),
  contact_phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  address: AddressSchema.optional(),
});

export const UpdateTenantSchema = CreateTenantSchema.partial().extend({
  id: z.string().uuid(),
});

export const TenantSchema = BaseEntitySchema.merge(CreateTenantSchema).extend({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  trial_ends_at: z.string().datetime().nullable(),
  subscription_renews_at: z.string().datetime().nullable(),
  limits: z.object({
    users: z.number().int().positive(),
    packages: z.number().int().positive(),
    bookings_per_month: z.number().int().positive(),
    storage_mb: z.number().int().positive(),
    whatsapp_per_day: z.number().int().positive(),
  }),
  usage: z.object({
    users: z.number().int().nonnegative(),
    packages: z.number().int().nonnegative(),
    bookings_this_month: z.number().int().nonnegative(),
    storage_used_mb: z.number().int().nonnegative(),
    whatsapp_today: z.number().int().nonnegative(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TenantLimitsSchema = z.object({
  users: z.number().int().positive(),
  packages: z.number().int().positive(),
  bookings_per_month: z.number().int().positive(),
  storage_mb: z.number().int().positive(),
  whatsapp_per_day: z.number().int().positive(),
});

export const TenantUsageSchema = z.object({
  users: z.number().int().nonnegative(),
  packages: z.number().int().nonnegative(),
  bookings_this_month: z.number().int().nonnegative(),
  storage_used_mb: z.number().int().nonnegative(),
  whatsapp_today: z.number().int().nonnegative(),
});

export const TenantInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  domain: z.string().nullable(),
  plan: TenantPlanSchema,
  status: TenantStatusSchema,
  settings: TenantSettingsSchema,
  limits: TenantLimitsSchema,
  usage: TenantUsageSchema,
  trial_ends_at: z.string().datetime().nullable(),
  subscription_renews_at: z.string().datetime().nullable(),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
export type TenantInfo = z.infer<typeof TenantInfoSchema>;
export type TenantStatus = z.infer<typeof TenantStatusSchema>;
export type TenantPlan = z.infer<typeof TenantPlanSchema>;
export type TenantSettings = z.infer<typeof TenantSettingsSchema>;