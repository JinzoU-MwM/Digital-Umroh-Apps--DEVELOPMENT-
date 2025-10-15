import { z } from 'zod';
import { BookingStatus, PaymentStatus, RoomType } from '@prisma/client';
export declare const CreateBookingSchema: z.ZodObject<{
    customer_id: z.ZodString;
    package_id: z.ZodString;
    room_type: z.ZodNativeEnum<{
        QUAD: "QUAD";
        TRIPLE: "TRIPLE";
        DOUBLE: "DOUBLE";
        SINGLE: "SINGLE";
    }>;
    number_of_pilgrims: z.ZodNumber;
    special_requests: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    departure_date: z.ZodString;
    return_date: z.ZodString;
    terms: z.ZodObject<{
        dp: z.ZodNumber;
        remaining: z.ZodNumber;
        dueDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        dp?: number;
        remaining?: number;
        dueDate?: string;
    }, {
        dp?: number;
        remaining?: number;
        dueDate?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    terms?: {
        dp?: number;
        remaining?: number;
        dueDate?: string;
    };
    notes?: string;
    customer_id?: string;
    package_id?: string;
    number_of_pilgrims?: number;
    special_requests?: string;
    departure_date?: string;
    return_date?: string;
}, {
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    terms?: {
        dp?: number;
        remaining?: number;
        dueDate?: string;
    };
    notes?: string;
    customer_id?: string;
    package_id?: string;
    number_of_pilgrims?: number;
    special_requests?: string;
    departure_date?: string;
    return_date?: string;
}>;
export declare const UpdateBookingSchema: z.ZodObject<{
    room_type: z.ZodOptional<z.ZodNativeEnum<{
        QUAD: "QUAD";
        TRIPLE: "TRIPLE";
        DOUBLE: "DOUBLE";
        SINGLE: "SINGLE";
    }>>;
    number_of_pilgrims: z.ZodOptional<z.ZodNumber>;
    special_requests: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    departure_date: z.ZodOptional<z.ZodString>;
    return_date: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PAID: "PAID";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
        COMPLETED: "COMPLETED";
    }>>;
    payment_status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        PARTIAL: "PARTIAL";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
        FAILED: "FAILED";
    }>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "DRAFT" | "CANCELLED" | "COMPLETED" | "CONFIRMED" | "PAID" | "REFUNDED";
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    notes?: string;
    payment_status?: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "FAILED";
    number_of_pilgrims?: number;
    special_requests?: string;
    departure_date?: string;
    return_date?: string;
}, {
    status?: "PENDING" | "DRAFT" | "CANCELLED" | "COMPLETED" | "CONFIRMED" | "PAID" | "REFUNDED";
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    notes?: string;
    payment_status?: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "FAILED";
    number_of_pilgrims?: number;
    special_requests?: string;
    departure_date?: string;
    return_date?: string;
}>;
export declare const BookingQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        DRAFT: "DRAFT";
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PAID: "PAID";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
        COMPLETED: "COMPLETED";
    }>>;
    payment_status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        PARTIAL: "PARTIAL";
        PAID: "PAID";
        OVERDUE: "OVERDUE";
        FAILED: "FAILED";
    }>>;
    room_type: z.ZodOptional<z.ZodNativeEnum<{
        QUAD: "QUAD";
        TRIPLE: "TRIPLE";
        DOUBLE: "DOUBLE";
        SINGLE: "SINGLE";
    }>>;
    package_id: z.ZodOptional<z.ZodString>;
    customer_id: z.ZodOptional<z.ZodString>;
    departure_from: z.ZodOptional<z.ZodString>;
    departure_to: z.ZodOptional<z.ZodString>;
    created_from: z.ZodOptional<z.ZodString>;
    created_to: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["booking_code", "status", "payment_status", "created_at", "departure_date"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    status?: "PENDING" | "DRAFT" | "CANCELLED" | "COMPLETED" | "CONFIRMED" | "PAID" | "REFUNDED";
    page?: number;
    limit?: number;
    sortBy?: "status" | "created_at" | "booking_code" | "payment_status" | "departure_date";
    sortOrder?: "asc" | "desc";
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    created_from?: string;
    created_to?: string;
    customer_id?: string;
    package_id?: string;
    payment_status?: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "FAILED";
    departure_from?: string;
    departure_to?: string;
}, {
    search?: string;
    status?: "PENDING" | "DRAFT" | "CANCELLED" | "COMPLETED" | "CONFIRMED" | "PAID" | "REFUNDED";
    page?: number;
    limit?: number;
    sortBy?: "status" | "created_at" | "booking_code" | "payment_status" | "departure_date";
    sortOrder?: "asc" | "desc";
    room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    created_from?: string;
    created_to?: string;
    customer_id?: string;
    package_id?: string;
    payment_status?: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "FAILED";
    departure_from?: string;
    departure_to?: string;
}>;
export declare class TermsDto {
    dp: number;
    remaining: number;
    dueDate: string;
}
export declare class CreateBookingDto {
    customer_id: string;
    package_id: string;
    room_type: RoomType;
    number_of_pilgrims: number;
    special_requests?: string;
    notes?: string;
    departure_date: string;
    return_date: string;
    terms: TermsDto;
}
export declare class UpdateBookingDto {
    room_type?: RoomType;
    number_of_pilgrims?: number;
    special_requests?: string;
    notes?: string;
    departure_date?: string;
    return_date?: string;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
}
export declare class BookingQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
    room_type?: RoomType;
    package_id?: string;
    customer_id?: string;
    departure_from?: string;
    departure_to?: string;
    created_from?: string;
    created_to?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
