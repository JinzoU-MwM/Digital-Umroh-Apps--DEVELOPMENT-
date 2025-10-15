import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsArray, MinLength, MaxLength, Min, Max, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

export class InvoiceItemDto {
  @ApiProperty({ description: 'Item description' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  description: string;

  @ApiProperty({ description: 'Item quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsNumber()
  @Min(0)
  discount?: number = 0;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @Min(0)
  tax?: number = 0;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @MinLength(1)
  customer_id: string;

  @ApiProperty({ description: 'Booking ID (optional)' })
  @IsString()
  @MinLength(1)
  booking_id?: string;

  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  invoice_number: string;

  @ApiProperty({ description: 'Invoice issue date' })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ description: 'Invoice due date' })
  @IsDateString()
  due_date: string;

  @ApiPropertyOptional({ description: 'Invoice notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Customer billing address' })
  @IsString()
  @MaxLength(500)
  billing_address?: string;

  @ApiPropertyOptional({ description: 'Customer email for invoice' })
  @IsString()
  @MaxLength(255)
  billing_email?: string;

  @ApiPropertyOptional({ description: 'Customer phone for invoice' })
  @IsString()
  @MaxLength(20)
  billing_phone?: string;

  @ApiProperty({ description: 'Tax rate (percentage)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate?: number = 0;

  @ApiProperty({ description: 'Discount amount' })
  @IsNumber()
  @Min(0)
  discount_amount?: number = 0;

  @ApiProperty({ description: 'Invoice items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Payment terms (days)' })
  @IsNumber()
  @Min(0)
  payment_terms?: number = 30;

  @ApiPropertyOptional({ description: 'Late fee percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  late_fee_percentage?: number = 0;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsObject()
  custom_fields?: Record<string, any>;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsString()
  @MinLength(1)
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Booking ID' })
  @IsString()
  @MinLength(1)
  booking_id?: string;

  @ApiPropertyOptional({ description: 'Invoice number' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  invoice_number?: string;

  @ApiPropertyOptional({ description: 'Invoice issue date' })
  @IsDateString()
  issue_date?: string;

  @ApiPropertyOptional({ description: 'Invoice due date' })
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Invoice notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Customer billing address' })
  @IsString()
  @MaxLength(500)
  billing_address?: string;

  @ApiPropertyOptional({ description: 'Customer email for invoice' })
  @IsString()
  @MaxLength(255)
  billing_email?: string;

  @ApiPropertyOptional({ description: 'Customer phone for invoice' })
  @IsString()
  @MaxLength(20)
  billing_phone?: string;

  @ApiPropertyOptional({ description: 'Tax rate (percentage)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Invoice items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Payment terms (days)' })
  @IsNumber()
  @Min(0)
  payment_terms?: number;

  @ApiPropertyOptional({ description: 'Late fee percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  late_fee_percentage?: number;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsObject()
  custom_fields?: Record<string, any>;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by invoice number, customer name' })
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Filter by booking ID' })
  @IsString()
  booking_id?: string;

  @ApiPropertyOptional({ description: 'Filter by date from' })
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Filter by date to' })
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by due date from' })
  @IsDateString()
  due_date_from?: string;

  @ApiPropertyOptional({ description: 'Filter by due date to' })
  @IsDateString()
  due_date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by overdue status' })
  @IsEnum(['overdue', 'due_soon', 'on_time'])
  overdue_status?: 'overdue' | 'due_soon' | 'on_time';

  @ApiPropertyOptional({ description: 'Sort field', default: 'created_at' })
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaymentDto {
  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsDateString()
  payment_date?: string;
}