import { IsEmail, IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDateString, Min } from 'class-validator';
import { z } from 'zod';
import { BookingStatus, PaymentStatus, RoomType } from '@prisma/client';

// Terms schema
const TermsSchema = z.object({
  dp: z.number(),
  remaining: z.number(),
  dueDate: z.string(),
});

// Zod schemas for validation
export const CreateBookingSchema = z.object({
  customer_id: z.string(),
  package_id: z.string(),
  room_type: z.nativeEnum(RoomType),
  number_of_pilgrims: z.number().min(1),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  departure_date: z.string(),
  return_date: z.string(),
  terms: TermsSchema,
});

export const UpdateBookingSchema = z.object({
  room_type: z.nativeEnum(RoomType).optional(),
  number_of_pilgrims: z.number().min(1).optional(),
  special_requests: z.string().optional(),
  notes: z.string().optional(),
  departure_date: z.string().optional(),
  return_date: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
});

export const BookingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  payment_status: z.nativeEnum(PaymentStatus).optional(),
  room_type: z.nativeEnum(RoomType).optional(),
  package_id: z.string().optional(),
  customer_id: z.string().optional(),
  departure_from: z.string().optional(),
  departure_to: z.string().optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
  sortBy: z.enum(['booking_code', 'status', 'payment_status', 'created_at', 'departure_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// DTO classes for Swagger documentation
export class TermsDto {
  @IsNumber()
  @Min(0)
  dp: number;

  @IsNumber()
  @Min(0)
  remaining: number;

  @IsDateString()
  dueDate: string;
}

export class CreateBookingDto {
  @IsString()
  customer_id: string;

  @IsString()
  package_id: string;

  @IsEnum(RoomType)
  room_type: RoomType;

  @IsNumber()
  @Min(1)
  number_of_pilgrims: number;

  @IsString()
  @IsOptional()
  special_requests?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  departure_date: string;

  @IsDateString()
  return_date: string;

  terms: TermsDto;
}

export class UpdateBookingDto {
  @IsEnum(RoomType)
  @IsOptional()
  room_type?: RoomType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  number_of_pilgrims?: number;

  @IsString()
  @IsOptional()
  special_requests?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  departure_date?: string;

  @IsDateString()
  @IsOptional()
  return_date?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;
}

export class BookingQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;

  @IsEnum(RoomType)
  @IsOptional()
  room_type?: RoomType;

  @IsString()
  @IsOptional()
  package_id?: string;

  @IsString()
  @IsOptional()
  customer_id?: string;

  @IsDateString()
  @IsOptional()
  departure_from?: string;

  @IsDateString()
  @IsOptional()
  departure_to?: string;

  @IsDateString()
  @IsOptional()
  created_from?: string;

  @IsDateString()
  @IsOptional()
  created_to?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'created_at';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}