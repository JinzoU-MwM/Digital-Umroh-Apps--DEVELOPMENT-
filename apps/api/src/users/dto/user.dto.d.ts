import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodNativeEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        FINANCE: "FINANCE";
        OPERATION: "OPERATION";
        SALES: "SALES";
        VIEWER: "VIEWER";
    }>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    permissions?: string[];
}, {
    name?: string;
    email?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    permissions?: string[];
}>;
export declare const UpdateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        FINANCE: "FINANCE";
        OPERATION: "OPERATION";
        SALES: "SALES";
        VIEWER: "VIEWER";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
    }>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
    permissions?: string[];
}, {
    name?: string;
    phone?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
    permissions?: string[];
}>;
export declare const UserQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<{
        OWNER: "OWNER";
        ADMIN: "ADMIN";
        FINANCE: "FINANCE";
        OPERATION: "OPERATION";
        SALES: "SALES";
        VIEWER: "VIEWER";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        SUSPENDED: "SUSPENDED";
    }>>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "email", "role", "status", "created_at"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
    page?: number;
    limit?: number;
    sortBy?: "name" | "email" | "role" | "status" | "created_at";
    sortOrder?: "asc" | "desc";
}, {
    search?: string;
    role?: "OWNER" | "ADMIN" | "FINANCE" | "OPERATION" | "SALES" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
    page?: number;
    limit?: number;
    sortBy?: "name" | "email" | "role" | "status" | "created_at";
    sortOrder?: "asc" | "desc";
}>;
export declare class CreateUserDto {
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    permissions?: string[];
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
    permissions?: string[];
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
