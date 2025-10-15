import { z } from 'zod';
import { UserRole } from '@prisma/client';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodNativeEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        FINANCE: "FINANCE";
        OPERATION: "OPERATION";
        SALES: "SALES";
        VIEWER: "VIEWER";
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
}, {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
}>;
export declare const OtpRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
}, {
    email?: string;
}>;
export declare const OtpVerifySchema: z.ZodObject<{
    email: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    code?: string;
}, {
    email?: string;
    code?: string;
}>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token?: string;
    password?: string;
}, {
    token?: string;
    password?: string;
}>;
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
}
export declare class OtpRequestDto {
    email: string;
}
export declare class OtpVerifyDto {
    email: string;
    code: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
