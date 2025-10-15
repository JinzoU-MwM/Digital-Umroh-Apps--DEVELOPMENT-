import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod, PaymentProvider } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  @MinLength(1)
  customer_id: string;

  @ApiProperty({ description: 'Booking ID (optional)' })
  @IsString()
  @MinLength(1)
  booking_id?: string;

  @ApiProperty({ description: 'Invoice ID (optional)' })
  @IsString()
  @MinLength(1)
  invoice_id?: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment provider' })
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({ description: 'External transaction ID' })
  @IsString()
  @MaxLength(200)
  external_transaction_id?: string;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional({ description: 'Payment description' })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string = 'IDR';

  @ApiPropertyOptional({ description: 'Exchange rate' })
  @IsNumber()
  @Min(0)
  exchange_rate?: number = 1;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: Record<string, any>;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: 'Payment status' })
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment provider' })
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({ description: 'External transaction ID' })
  @IsString()
  @MaxLength(200)
  external_transaction_id?: string;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsString()
  @MaxLength(100)
  reference_number?: string;

  @ApiPropertyOptional({ description: 'Payment description' })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Exchange rate' })
  @IsNumber()
  @Min(0)
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Metadata' })
  metadata?: Record<string, any>;
}

export class PaymentQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by reference number, transaction ID' })
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Filter by method' })
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Filter by provider' })
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Filter by booking ID' })
  @IsString()
  booking_id?: string;

  @ApiPropertyOptional({ description: 'Filter by invoice ID' })
  @IsString()
  invoice_id?: string;

  @ApiPropertyOptional({ description: 'Filter by date from' })
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Filter by date to' })
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by amount min' })
  @IsNumber()
  @Min(0)
  amount_min?: number;

  @ApiPropertyOptional({ description: 'Filter by amount max' })
  @IsNumber()
  @Min(0)
  amount_max?: number;

  @ApiPropertyOptional({ description: 'Sort field', default: 'created_at' })
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Refund reason' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Refund notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'External refund ID' })
  @IsString()
  @MaxLength(200)
  external_refund_id?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Payment provider' })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ description: 'Webhook event type' })
  @IsString()
  @MinLength(1)
  event_type: string;

  @ApiProperty({ description: 'Payment ID' })
  @IsString()
  @MinLength(1)
  payment_id?: string;

  @ApiProperty({ description: 'External transaction ID' })
  @IsString()
  @MinLength(1)
  external_transaction_id: string;

  @ApiProperty({ description: 'Payment status' })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Payment amount' })
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Raw webhook data' })
  data?: Record<string, any>;
}