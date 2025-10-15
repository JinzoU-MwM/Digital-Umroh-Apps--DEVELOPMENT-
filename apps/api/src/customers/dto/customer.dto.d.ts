import { z } from 'zod';
export declare const CreateCustomerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodString;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    }, {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    }>>;
    id_type: z.ZodString;
    id_number: z.ZodString;
    birth_date: z.ZodString;
    gender: z.ZodEnum<["MALE", "FEMALE"]>;
    nationality: z.ZodDefault<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    };
    notes?: string;
    id_type?: string;
    id_number?: string;
    birth_date?: string;
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
}, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    };
    notes?: string;
    id_type?: string;
    id_number?: string;
    birth_date?: string;
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
}>;
export declare const UpdateCustomerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    }, {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    }>>;
    id_type: z.ZodOptional<z.ZodString>;
    id_number: z.ZodOptional<z.ZodString>;
    birth_date: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE"]>>;
    nationality: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    };
    notes?: string;
    id_type?: string;
    id_number?: string;
    birth_date?: string;
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
}, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        city?: string;
        street?: string;
        province?: string;
        postal_code?: string;
        country?: string;
    };
    notes?: string;
    id_type?: string;
    id_number?: string;
    birth_date?: string;
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
}>;
export declare const CustomerQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE"]>>;
    nationality: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    created_from: z.ZodOptional<z.ZodString>;
    created_to: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "email", "phone", "created_at", "updated_at"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "email" | "phone" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
    created_from?: string;
    created_to?: string;
}, {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "email" | "phone" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    gender?: "MALE" | "FEMALE";
    nationality?: string;
    company?: string;
    created_from?: string;
    created_to?: string;
}>;
export declare class AddressDto {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
}
export declare class CreateCustomerDto {
    name: string;
    email?: string;
    phone: string;
    address?: AddressDto;
    id_type: string;
    id_number: string;
    birth_date: Date;
    gender: 'MALE' | 'FEMALE';
    nationality?: string;
    company?: string;
    notes?: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: AddressDto;
    id_type?: string;
    id_number?: string;
    birth_date?: Date;
    gender?: 'MALE' | 'FEMALE';
    nationality?: string;
    company?: string;
    notes?: string;
}
export declare class CustomerQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    gender?: 'MALE' | 'FEMALE';
    nationality?: string;
    company?: string;
    created_from?: Date;
    created_to?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
