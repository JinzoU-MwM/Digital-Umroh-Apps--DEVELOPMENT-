import { z } from 'zod';
import { BaseEntitySchema, MoneySchema, DateRangeSchema } from './common';

export const PackageStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'FULL',
  'CANCELLED',
  'COMPLETED'
]);

export const RoomTypeSchema = z.enum([
  'QUAD', // 4 persons
  'TRIPLE', // 3 persons
  'DOUBLE', // 2 persons
  'SINGLE' // 1 person
]);

export const PackageTypeSchema = z.enum([
  'UMRAH',
  'HAJI_PLUS',
  'HAJI_REGULER'
]);

export const CreatePackageSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(3).max(20).regex(/^[A-Z0-9-]+$/),
  type: PackageTypeSchema,
  description: z.string().optional(),
  period: DateRangeSchema,
  quota: z.number().int().positive(),
  hotels: z.array(z.object({
    name: z.string(),
    city: z.string(),
    rating: z.number().min(1).max(5).optional(),
    checkin: z.string().datetime(),
    checkout: z.string().datetime(),
    room_type: z.string(),
  })).default([]),
  flights: z.array(z.object({
    airline: z.string(),
    flight_number: z.string(),
    departure: z.object({
      airport: z.string(),
      city: z.string(),
      datetime: z.string().datetime(),
    }),
    arrival: z.object({
      airport: z.string(),
      city: z.string(),
      datetime: z.string().datetime(),
    }),
  })).default([]),
  itinerary: z.array(z.object({
    day: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    time: z.string().optional(),
    location: z.string().optional(),
  })).default([]),
  prices: z.object({
    quad: MoneySchema,
    triple: MoneySchema,
    double: MoneySchema,
    single: MoneySchema,
  }),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  terms: z.string().optional(),
  notes: z.string().optional(),
  status: PackageStatusSchema.default('DRAFT'),
  featured_image_url: z.string().url().optional(),
  gallery_images: z.array(z.string().url()).default([]),
  documents_required: z.array(z.string()).default([
    'Passport',
    'Photo 4x6 (4 lembar)',
    'KTP',
    'KK',
    'Akte Kelahiran',
    'Buku Nikah (suami-istri)',
  ]),
});

export const UpdatePackageSchema = CreatePackageSchema.partial().extend({
  id: z.string().uuid(),
});

export const PackageSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  type: PackageTypeSchema,
  description: z.string().nullable(),
  period: DateRangeSchema,
  quota: z.number().int().positive(),
  quota_booked: z.number().int().nonnegative().default(0),
  quota_available: z.number().int().nonnegative(),
  hotels: z.array(z.object({
    name: z.string(),
    city: z.string(),
    rating: z.number().min(1).max(5).nullable(),
    checkin: z.string().datetime(),
    checkout: z.string().datetime(),
    room_type: z.string(),
  })),
  flights: z.array(z.object({
    airline: z.string(),
    flight_number: z.string(),
    departure: z.object({
      airport: z.string(),
      city: z.string(),
      datetime: z.string().datetime(),
    }),
    arrival: z.object({
      airport: z.string(),
      city: z.string(),
      datetime: z.string().datetime(),
    }),
  })),
  itinerary: z.array(z.object({
    day: z.number().int().positive(),
    title: z.string(),
    description: z.string(),
    time: z.string().nullable(),
    location: z.string().nullable(),
  })),
  prices: z.object({
    quad: MoneySchema,
    triple: MoneySchema,
    double: MoneySchema,
    single: MoneySchema,
  }),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  terms: z.string().nullable(),
  notes: z.string().nullable(),
  status: PackageStatusSchema,
  featured_image_url: z.string().url().nullable(),
  gallery_images: z.array(z.string().url()),
  documents_required: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const PackagePricingSchema = z.object({
  room_type: RoomTypeSchema,
  base_price: MoneySchema,
  tax_percentage: z.number().min(0).max(100).default(11),
  tax_amount: MoneySchema,
  total_price: MoneySchema,
});

export const PackageAvailabilitySchema = z.object({
  package_id: z.string().uuid(),
  quota_total: z.number().int().positive(),
  quota_booked: z.number().int().nonnegative(),
  quota_available: z.number().int().nonnegative(),
  is_available: z.boolean(),
  waiting_list_count: z.number().int().nonnegative().default(0),
});

export const PackageSearchSchema = z.object({
  query: z.string().optional(),
  type: PackageTypeSchema.optional(),
  status: PackageStatusSchema.optional(),
  price_min: z.number().nonnegative().optional(),
  price_max: z.number().nonnegative().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  has_availability: z.boolean().optional(),
});

export type Package = z.infer<typeof PackageSchema>;
export type CreatePackageDto = z.infer<typeof CreatePackageSchema>;
export type UpdatePackageDto = z.infer<typeof UpdatePackageSchema>;
export type PackageStatus = z.infer<typeof PackageStatusSchema>;
export type PackageType = z.infer<typeof PackageTypeSchema>;
export type RoomType = z.infer<typeof RoomTypeSchema>;
export type PackagePricing = z.infer<typeof PackagePricingSchema>;
export type PackageAvailability = z.infer<typeof PackageAvailabilitySchema>;
export type PackageSearchParams = z.infer<typeof PackageSearchSchema>;