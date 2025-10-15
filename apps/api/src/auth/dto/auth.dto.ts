import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Zod schemas for validation
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.VIEWER),
});

export const OtpRequestSchema = z.object({
  email: z.string().email(),
});

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

// DTO classes for Swagger documentation
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class OtpRequestDto {
  @IsEmail()
  email: string;
}

export class OtpVerifyDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}