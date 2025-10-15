import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDateString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { z } from 'zod';
import { PackageType, PackageStatus } from '@prisma/client';

// Money type schema
const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

// Hotel schema
const HotelSchema = z.object({
  name: z.string(),
  city: z.string(),
  rating: z.number().min(1).max(5),
  checkin: z.string(),
  checkout: z.string(),
  room_type: z.enum(['QUAD', 'TRIPLE', 'DOUBLE', 'SINGLE']),
});

// Flight schema
const FlightSchema = z.object({
  airline: z.string(),
  flight_number: z.string(),
  from: z.string(),
  to: z.string(),
  departure: z.string(),
  arrival: z.string(),
  type: z.enum(['DEPARTURE', 'RETURN']),
});

// Itinerary schema
const ItinerarySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
});

// Zod schemas for validation
export const CreatePackageSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(3).max(20),
  type: z.nativeEnum(PackageType),
  description: z.string().optional(),
  period_from: z.string(),
  period_to: z.string(),
  quota: z.number().min(1),
  hotels: z.array(HotelSchema).default([]),
  flights: z.array(FlightSchema).default([]),
  itinerary: z.array(ItinerarySchema).default([]),
  price_quad: MoneySchema,
  price_triple: MoneySchema,
  price_double: MoneySchema,
  price_single: MoneySchema,
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  terms: z.string().optional(),
  notes: z.string().optional(),
  featured_image_url: z.string().optional(),
  gallery_images: z.array(z.string()).default([]),
  documents_required: z.array(z.string()).default([]),
});

export const UpdatePackageSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  code: z.string().min(3).max(20).optional(),
  type: z.nativeEnum(PackageType).optional(),
  description: z.string().optional(),
  period_from: z.string().optional(),
  period_to: z.string().optional(),
  quota: z.number().min(1).optional(),
  hotels: z.array(HotelSchema).optional(),
  flights: z.array(FlightSchema).optional(),
  itinerary: z.array(ItinerarySchema).optional(),
  price_quad: MoneySchema.optional(),
  price_triple: MoneySchema.optional(),
  price_double: MoneySchema.optional(),
  price_single: MoneySchema.optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  featured_image_url: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  documents_required: z.array(z.string()).optional(),
});

export const PackageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(PackageType).optional(),
  status: z.nativeEnum(PackageStatus).optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  period_from: z.string().optional(),
  period_to: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'type', 'status', 'period_from', 'quota', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// DTO classes for Swagger documentation
export class MoneyDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;
}

export class HotelDto {
  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  checkin: string;

  @IsString()
  checkout: string;

  @IsString()
  room_type: 'QUAD' | 'TRIPLE' | 'DOUBLE' | 'SINGLE';
}

export class FlightDto {
  @IsString()
  airline: string;

  @IsString()
  flight_number: string;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsString()
  departure: string;

  @IsString()
  arrival: string;

  @IsString()
  type: 'DEPARTURE' | 'RETURN';
}

export class ItineraryDto {
  @IsNumber()
  day: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class CreatePackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code: string;

  @IsEnum(PackageType)
  type: PackageType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  period_from: string;

  @IsDateString()
  period_to: string;

  @IsNumber()
  @Min(1)
  quota: number;

  @IsArray()
  @IsOptional()
  hotels?: HotelDto[];

  @IsArray()
  @IsOptional()
  flights?: FlightDto[];

  @IsArray()
  @IsOptional()
  itinerary?: ItineraryDto[];

  price_quad: MoneyDto;

  price_triple: MoneyDto;

  price_double: MoneyDto;

  price_single: MoneyDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inclusions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  featured_image_url?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery_images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents_required?: string[];
}

export class UpdatePackageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsOptional()
  code?: string;

  @IsEnum(PackageType)
  @IsOptional()
  type?: PackageType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  period_from?: string;

  @IsDateString()
  @IsOptional()
  period_to?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quota?: number;

  @IsArray()
  @IsOptional()
  hotels?: HotelDto[];

  @IsArray()
  @IsOptional()
  flights?: FlightDto[];

  @IsArray()
  @IsOptional()
  itinerary?: ItineraryDto[];

  @IsOptional()
  price_quad?: MoneyDto;

  @IsOptional()
  price_triple?: MoneyDto;

  @IsOptional()
  price_double?: MoneyDto;

  @IsOptional()
  price_single?: MoneyDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inclusions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  featured_image_url?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery_images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents_required?: string[];
}

export class PackageQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(PackageType)
  @IsOptional()
  type?: PackageType;

  @IsEnum(PackageStatus)
  @IsOptional()
  status?: PackageStatus;

  @IsNumber()
  @IsOptional()
  price_min?: number;

  @IsNumber()
  @IsOptional()
  price_max?: number;

  @IsDateString()
  @IsOptional()
  period_from?: string;

  @IsDateString()
  @IsOptional()
  period_to?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'created_at';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}