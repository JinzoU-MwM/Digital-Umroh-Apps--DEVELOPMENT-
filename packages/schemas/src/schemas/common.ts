import { z } from 'zod';

export const UUIDSchema = z.string().uuid();

export const TenantIdSchema = UUIDSchema;

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchSchema = z.object({
  q: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

export const DateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const BaseEntitySchema = z.object({
  id: UUIDSchema,
  tenant_id: TenantIdSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export const AuditSchema = z.object({
  created_by: UUIDSchema.optional(),
  updated_by: UUIDSchema.optional(),
});

export const ApiKeySchema = z.string().min(32).max(128);

export const CurrencySchema = z.enum(['IDR', 'USD', 'SAR']);

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: CurrencySchema.default('IDR'),
});

export const PhoneSchema = z.string().regex(/^\+?[0-9]{8,15}$/);

export const EmailSchema = z.string().email();

export const UrlSchema = z.string().url();

export const FileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().nonnegative().max(10 * 1024 * 1024), // 10MB
  url: UrlSchema.optional(),
});

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('Indonesia'),
});

export const PaginationResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      pages: z.number().int().nonnegative(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string().datetime(),
    requestId: z.string().optional(),
  }),
});

export const SuccessResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.any()).optional(),
  });

export type PaginationParams = z.infer<typeof PaginationSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type BaseEntity = z.infer<typeof BaseEntitySchema>;
export type AuditInfo = z.infer<typeof AuditSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Address = z.infer<typeof AddressSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;