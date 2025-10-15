import { IsEmail, IsString, IsOptional, IsDate, MinLength, MaxLength, IsEnum } from 'class-validator';
import { z } from 'zod';

// Address schema
const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('Indonesia'),
});

// Zod schemas for validation
export const CreateCustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string(),
  address: AddressSchema.optional(),
  id_type: z.string().min(1),
  id_number: z.string().min(1),
  birth_date: z.string(),
  gender: z.enum(['MALE', 'FEMALE']),
  nationality: z.string().default('Indonesia'),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: AddressSchema.optional(),
  id_type: z.string().min(1).optional(),
  id_number: z.string().min(1).optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  nationality: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const CustomerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  nationality: z.string().optional(),
  company: z.string().optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'phone', 'created_at', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// DTO classes for Swagger documentation
export class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  phone: string;

  @IsOptional()
  address?: AddressDto;

  @IsString()
  id_type: string;

  @IsString()
  id_number: string;

  @IsDate()
  birth_date: Date;

  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  id_type?: string;

  @IsString()
  @IsOptional()
  id_number?: string;

  @IsDate()
  @IsOptional()
  birth_date?: Date;

  @IsEnum(['MALE', 'FEMALE'])
  @IsOptional()
  gender?: 'MALE' | 'FEMALE';

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CustomerQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(['MALE', 'FEMALE'])
  @IsOptional()
  gender?: 'MALE' | 'FEMALE';

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsDate()
  @IsOptional()
  created_from?: Date;

  @IsDate()
  @IsOptional()
  created_to?: Date;

  @IsString()
  @IsOptional()
  sortBy?: string = 'created_at';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}