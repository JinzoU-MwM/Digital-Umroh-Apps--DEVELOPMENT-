import { z } from 'zod';
import { PackageType, PackageStatus } from '@prisma/client';
export declare const CreatePackageSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    type: z.ZodNativeEnum<{
        UMRAH: "UMRAH";
        HAJI_PLUS: "HAJI_PLUS";
        HAJI_REGULER: "HAJI_REGULER";
    }>;
    description: z.ZodOptional<z.ZodString>;
    period_from: z.ZodString;
    period_to: z.ZodString;
    quota: z.ZodNumber;
    hotels: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        city: z.ZodString;
        rating: z.ZodNumber;
        checkin: z.ZodString;
        checkout: z.ZodString;
        room_type: z.ZodEnum<["QUAD", "TRIPLE", "DOUBLE", "SINGLE"]>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }, {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }>, "many">>;
    flights: z.ZodDefault<z.ZodArray<z.ZodObject<{
        airline: z.ZodString;
        flight_number: z.ZodString;
        from: z.ZodString;
        to: z.ZodString;
        departure: z.ZodString;
        arrival: z.ZodString;
        type: z.ZodEnum<["DEPARTURE", "RETURN"]>;
    }, "strip", z.ZodTypeAny, {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }, {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }>, "many">>;
    itinerary: z.ZodDefault<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        title: z.ZodString;
        description: z.ZodString;
        time: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }, {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }>, "many">>;
    price_quad: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>;
    price_triple: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>;
    price_double: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>;
    price_single: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>;
    inclusions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    exclusions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    terms: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    featured_image_url: z.ZodOptional<z.ZodString>;
    gallery_images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    documents_required: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    code?: string;
    description?: string;
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    period_from?: string;
    period_to?: string;
    quota?: number;
    hotels?: {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }[];
    flights?: {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }[];
    itinerary?: {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }[];
    price_quad?: {
        amount?: number;
        currency?: string;
    };
    price_triple?: {
        amount?: number;
        currency?: string;
    };
    price_double?: {
        amount?: number;
        currency?: string;
    };
    price_single?: {
        amount?: number;
        currency?: string;
    };
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}, {
    name?: string;
    code?: string;
    description?: string;
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    period_from?: string;
    period_to?: string;
    quota?: number;
    hotels?: {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }[];
    flights?: {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }[];
    itinerary?: {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }[];
    price_quad?: {
        amount?: number;
        currency?: string;
    };
    price_triple?: {
        amount?: number;
        currency?: string;
    };
    price_double?: {
        amount?: number;
        currency?: string;
    };
    price_single?: {
        amount?: number;
        currency?: string;
    };
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}>;
export declare const UpdatePackageSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        UMRAH: "UMRAH";
        HAJI_PLUS: "HAJI_PLUS";
        HAJI_REGULER: "HAJI_REGULER";
    }>>;
    description: z.ZodOptional<z.ZodString>;
    period_from: z.ZodOptional<z.ZodString>;
    period_to: z.ZodOptional<z.ZodString>;
    quota: z.ZodOptional<z.ZodNumber>;
    hotels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        city: z.ZodString;
        rating: z.ZodNumber;
        checkin: z.ZodString;
        checkout: z.ZodString;
        room_type: z.ZodEnum<["QUAD", "TRIPLE", "DOUBLE", "SINGLE"]>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }, {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }>, "many">>;
    flights: z.ZodOptional<z.ZodArray<z.ZodObject<{
        airline: z.ZodString;
        flight_number: z.ZodString;
        from: z.ZodString;
        to: z.ZodString;
        departure: z.ZodString;
        arrival: z.ZodString;
        type: z.ZodEnum<["DEPARTURE", "RETURN"]>;
    }, "strip", z.ZodTypeAny, {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }, {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }>, "many">>;
    itinerary: z.ZodOptional<z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        title: z.ZodString;
        description: z.ZodString;
        time: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }, {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }>, "many">>;
    price_quad: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>>;
    price_triple: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>>;
    price_double: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>>;
    price_single: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        currency?: string;
    }, {
        amount?: number;
        currency?: string;
    }>>;
    inclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    terms: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    featured_image_url: z.ZodOptional<z.ZodString>;
    gallery_images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    documents_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    code?: string;
    description?: string;
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    period_from?: string;
    period_to?: string;
    quota?: number;
    hotels?: {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }[];
    flights?: {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }[];
    itinerary?: {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }[];
    price_quad?: {
        amount?: number;
        currency?: string;
    };
    price_triple?: {
        amount?: number;
        currency?: string;
    };
    price_double?: {
        amount?: number;
        currency?: string;
    };
    price_single?: {
        amount?: number;
        currency?: string;
    };
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}, {
    name?: string;
    code?: string;
    description?: string;
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    period_from?: string;
    period_to?: string;
    quota?: number;
    hotels?: {
        name?: string;
        city?: string;
        rating?: number;
        checkin?: string;
        checkout?: string;
        room_type?: "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";
    }[];
    flights?: {
        from?: string;
        to?: string;
        type?: "DEPARTURE" | "RETURN";
        airline?: string;
        flight_number?: string;
        departure?: string;
        arrival?: string;
    }[];
    itinerary?: {
        description?: string;
        day?: number;
        title?: string;
        time?: string;
        location?: string;
    }[];
    price_quad?: {
        amount?: number;
        currency?: string;
    };
    price_triple?: {
        amount?: number;
        currency?: string;
    };
    price_double?: {
        amount?: number;
        currency?: string;
    };
    price_single?: {
        amount?: number;
        currency?: string;
    };
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}>;
export declare const PackageQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<{
        UMRAH: "UMRAH";
        HAJI_PLUS: "HAJI_PLUS";
        HAJI_REGULER: "HAJI_REGULER";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        DRAFT: "DRAFT";
        PUBLISHED: "PUBLISHED";
        FULL: "FULL";
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
    }>>;
    price_min: z.ZodOptional<z.ZodNumber>;
    price_max: z.ZodOptional<z.ZodNumber>;
    period_from: z.ZodOptional<z.ZodString>;
    period_to: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "code", "type", "status", "period_from", "quota", "created_at"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    status?: "DRAFT" | "PUBLISHED" | "FULL" | "CANCELLED" | "COMPLETED";
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    page?: number;
    limit?: number;
    sortBy?: "name" | "status" | "created_at" | "code" | "type" | "period_from" | "quota";
    sortOrder?: "asc" | "desc";
    period_from?: string;
    period_to?: string;
    price_min?: number;
    price_max?: number;
}, {
    search?: string;
    status?: "DRAFT" | "PUBLISHED" | "FULL" | "CANCELLED" | "COMPLETED";
    type?: "UMRAH" | "HAJI_PLUS" | "HAJI_REGULER";
    page?: number;
    limit?: number;
    sortBy?: "name" | "status" | "created_at" | "code" | "type" | "period_from" | "quota";
    sortOrder?: "asc" | "desc";
    period_from?: string;
    period_to?: string;
    price_min?: number;
    price_max?: number;
}>;
export declare class MoneyDto {
    amount: number;
    currency: string;
}
export declare class HotelDto {
    name: string;
    city: string;
    rating: number;
    checkin: string;
    checkout: string;
    room_type: 'QUAD' | 'TRIPLE' | 'DOUBLE' | 'SINGLE';
}
export declare class FlightDto {
    airline: string;
    flight_number: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    type: 'DEPARTURE' | 'RETURN';
}
export declare class ItineraryDto {
    day: number;
    title: string;
    description: string;
    time?: string;
    location?: string;
}
export declare class CreatePackageDto {
    name: string;
    code: string;
    type: PackageType;
    description?: string;
    period_from: string;
    period_to: string;
    quota: number;
    hotels?: HotelDto[];
    flights?: FlightDto[];
    itinerary?: ItineraryDto[];
    price_quad: MoneyDto;
    price_triple: MoneyDto;
    price_double: MoneyDto;
    price_single: MoneyDto;
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}
export declare class UpdatePackageDto {
    name?: string;
    code?: string;
    type?: PackageType;
    description?: string;
    period_from?: string;
    period_to?: string;
    quota?: number;
    hotels?: HotelDto[];
    flights?: FlightDto[];
    itinerary?: ItineraryDto[];
    price_quad?: MoneyDto;
    price_triple?: MoneyDto;
    price_double?: MoneyDto;
    price_single?: MoneyDto;
    inclusions?: string[];
    exclusions?: string[];
    terms?: string;
    notes?: string;
    featured_image_url?: string;
    gallery_images?: string[];
    documents_required?: string[];
}
export declare class PackageQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: PackageType;
    status?: PackageStatus;
    price_min?: number;
    price_max?: number;
    period_from?: string;
    period_to?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
