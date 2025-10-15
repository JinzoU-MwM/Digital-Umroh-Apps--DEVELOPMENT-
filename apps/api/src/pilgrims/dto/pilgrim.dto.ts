import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, MinLength, MaxLength, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, MaritalStatus, IDType } from '@prisma/client';

export class CreatePilgrimDto {
  @ApiProperty({ description: 'Full name of the pilgrim' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Nationality' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nationality: string;

  @ApiProperty({ description: 'Place of birth' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  place_of_birth: string;

  @ApiProperty({ description: 'Date of birth' })
  @IsDateString()
  birth_date: string;

  @ApiProperty({ description: 'Gender' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Marital status' })
  @IsEnum(MaritalStatus)
  marital_status: MaritalStatus;

  @ApiProperty({ description: 'Occupation' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  occupation: string;

  @ApiProperty({ description: 'Address' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address: string;

  @ApiProperty({ description: 'Mobile phone number' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Type of identification document' })
  @IsEnum(IDType)
  id_type: IDType;

  @ApiProperty({ description: 'Identification document number' })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  id_number: string;

  @ApiPropertyOptional({ description: 'Passport number' })
  @IsString()
  @MaxLength(50)
  passport_number?: string;

  @ApiPropertyOptional({ description: 'Passport issue date' })
  @IsDateString()
  passport_issue_date?: string;

  @ApiPropertyOptional({ description: 'Passport expiry date' })
  @IsDateString()
  passport_expiry_date?: string;

  @ApiPropertyOptional({ description: 'Passport issuing authority' })
  @IsString()
  @MaxLength(100)
  passport_issuing_authority?: string;

  @ApiPropertyOptional({ description: 'Family relationships' })
  @IsArray()
  family_relationships?: {
    relationship: string;
    name: string;
    phone?: string;
  }[];

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsString()
  @MaxLength(100)
  emergency_contact_name?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsString()
  @MaxLength(20)
  emergency_contact_phone?: string;

  @ApiPropertyOptional({ description: 'Emergency contact relationship' })
  @IsString()
  @MaxLength(50)
  emergency_contact_relationship?: string;

  @ApiPropertyOptional({ description: 'Health conditions or special needs' })
  @IsString()
  @MaxLength(1000)
  health_conditions?: string;

  @ApiPropertyOptional({ description: 'Food preferences or allergies' })
  @IsString()
  @MaxLength(500)
  food_preferences?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdatePilgrimDto {
  @ApiPropertyOptional({ description: 'Full name of the pilgrim' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Nationality' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nationality?: string;

  @ApiPropertyOptional({ description: 'Place of birth' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  place_of_birth?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsDateString()
  birth_date?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Marital status' })
  @IsEnum(MaritalStatus)
  marital_status?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Occupation' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Mobile phone number' })
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Type of identification document' })
  @IsEnum(IDType)
  id_type?: IDType;

  @ApiPropertyOptional({ description: 'Identification document number' })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  id_number?: string;

  @ApiPropertyOptional({ description: 'Passport number' })
  @IsString()
  @MaxLength(50)
  passport_number?: string;

  @ApiPropertyOptional({ description: 'Passport issue date' })
  @IsDateString()
  passport_issue_date?: string;

  @ApiPropertyOptional({ description: 'Passport expiry date' })
  @IsDateString()
  passport_expiry_date?: string;

  @ApiPropertyOptional({ description: 'Passport issuing authority' })
  @IsString()
  @MaxLength(100)
  passport_issuing_authority?: string;

  @ApiPropertyOptional({ description: 'Family relationships' })
  @IsArray()
  family_relationships?: {
    relationship: string;
    name: string;
    phone?: string;
  }[];

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsString()
  @MaxLength(100)
  emergency_contact_name?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsString()
  @MaxLength(20)
  emergency_contact_phone?: string;

  @ApiPropertyOptional({ description: 'Emergency contact relationship' })
  @IsString()
  @MaxLength(50)
  emergency_contact_relationship?: string;

  @ApiPropertyOptional({ description: 'Health conditions or special needs' })
  @IsString()
  @MaxLength(1000)
  health_conditions?: string;

  @ApiPropertyOptional({ description: 'Food preferences or allergies' })
  @IsString()
  @MaxLength(500)
  food_preferences?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class PilgrimQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by name, ID number, or phone' })
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by gender' })
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Filter by nationality' })
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Filter by marital status' })
  @IsEnum(MaritalStatus)
  marital_status?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Filter by booking ID' })
  @IsString()
  booking_id?: string;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'created_at' })
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', default: 'desc' })
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}