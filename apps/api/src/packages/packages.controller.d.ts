import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto, PackageQueryDto } from './dto/package.dto';
export declare class PackagesController {
    private readonly packagesService;
    constructor(packagesService: PackagesService);
    create(createPackageDto: CreatePackageDto, tenantId: string): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        };
        message: string;
    }>;
    findAll(query: PackageQueryDto, tenantId: string, req: any): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        }[];
        meta: {
            pagination: {
                page: number;
                limit: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
            total: number;
        };
        message: string;
    }>;
    findPublished(tenantId: string): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        }[];
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        };
        message: string;
    }>;
    update(id: string, updatePackageDto: UpdatePackageDto, tenantId: string): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        };
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    publish(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    unpublish(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    checkAvailability(id: string, tenantId: string): Promise<{
        data: {
            quota: number;
            booked: number;
            available: number;
            isFullyBooked: boolean;
            status: string;
            percentageBooked: number;
        };
        message: string;
    }>;
    getStats(tenantId: string): Promise<{
        data: {
            total: number;
            published: number;
            draft: number;
            full: number;
            available: number;
            byType: {
                type: import(".prisma/client").$Enums.PackageType;
                count: number;
            }[];
            averagePrices: {
                quad: number;
                double: number;
            };
        };
        message: string;
    }>;
    duplicate(id: string, tenantId: string): Promise<{
        data: {
            name: string;
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.PackageStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            code: string;
            description: string | null;
            type: import(".prisma/client").$Enums.PackageType;
            period_from: Date;
            period_to: Date;
            quota: number;
            hotels: import("@prisma/client/runtime/library").JsonValue[];
            flights: import("@prisma/client/runtime/library").JsonValue[];
            itinerary: import("@prisma/client/runtime/library").JsonValue[];
            price_quad: number;
            price_triple: number;
            price_double: number;
            price_single: number;
            inclusions: string[];
            exclusions: string[];
            terms: string | null;
            notes: string | null;
            featured_image_url: string | null;
            gallery_images: string[];
            documents_required: string[];
            quota_booked: number;
        };
        message: string;
    }>;
    exportToExcel(tenantId: string, query: PackageQueryDto): Promise<{
        data: import("exceljs").Buffer;
        message: string;
    }>;
}
