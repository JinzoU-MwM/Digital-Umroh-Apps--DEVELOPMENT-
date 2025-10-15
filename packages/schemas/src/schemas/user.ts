import { z } from 'zod';
import { BaseEntitySchema, EmailSchema, PhoneSchema } from './common';

export const UserRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'FINANCE',
  'OPERATION',
  'SALES',
  'VIEWER'
]);

export const UserStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'PENDING',
  'SUSPENDED'
]);

export const CreateUserSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1).max(100),
  phone: PhoneSchema.optional(),
  role: UserRoleSchema,
  status: UserStatusSchema.default('PENDING'),
  avatar_url: z.string().url().optional(),
  permissions: z.array(z.string()).optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string().uuid(),
});

export const UserSchema = BaseEntitySchema.extend({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  email: EmailSchema,
  name: z.string(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  avatar_url: z.string().url().nullable(),
  permissions: z.array(z.string()).default([]),
  email_verified_at: z.string().datetime().nullable(),
  phone_verified_at: z.string().datetime().nullable(),
  last_login_at: z.string().datetime().nullable(),
  password_changed_at: z.string().datetime().nullable(),
  two_factor_enabled: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  avatar_url: z.string().url().nullable(),
  email_verified_at: z.string().datetime().nullable(),
  last_login_at: z.string().datetime().nullable(),
  two_factor_enabled: z.boolean(),
  tenant: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    plan: z.string(),
  }),
});

export const AuthLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6),
  tenant_slug: z.string().min(3).optional(),
  remember_me: z.boolean().default(false),
});

export const AuthRegisterSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1).max(100),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  tenant_name: z.string().min(1).max(100),
  tenant_slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  phone: PhoneSchema.optional(),
  agree_terms: z.literal(true),
});

export const AuthOtpRequestSchema = z.object({
  email: EmailSchema,
  tenant_slug: z.string(),
});

export const AuthOtpVerifySchema = z.object({
  email: EmailSchema,
  token: z.string().length(6),
  tenant_slug: z.string(),
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirm_password: z.string().min(8),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
  tenant_slug: z.string(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  email: EmailSchema,
  new_password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirm_password: z.string().min(8),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type AuthLoginDto = z.infer<typeof AuthLoginSchema>;
export type AuthRegisterDto = z.infer<typeof AuthRegisterSchema>;
export type AuthOtpRequestDto = z.infer<typeof AuthOtpRequestSchema>;
export type AuthOtpVerifyDto = z.infer<typeof AuthOtpVerifySchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;