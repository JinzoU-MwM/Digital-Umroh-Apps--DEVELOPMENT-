import { PilgrimsService } from './pilgrims.service';
import { CreatePilgrimDto, UpdatePilgrimDto, PilgrimQueryDto } from './dto/pilgrim.dto';
export declare class PilgrimsController {
    private readonly pilgrimsService;
    constructor(pilgrimsService: PilgrimsService);
    create(createPilgrimDto: CreatePilgrimDto, req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            customer_id: string;
            booking_id: string;
            birth_place: string;
            passport_number: string | null;
            passport_expiry: Date | null;
            family_relationship: string;
            emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
            room_number: string | null;
            building: string | null;
            floor: number | null;
            documents: import("@prisma/client/runtime/library").JsonValue[];
            document_completion: number;
        };
        message: string;
    }>;
    bulkCreate(pilgrimsData: CreatePilgrimDto[], req: any): Promise<{
        success: boolean;
        data: {
            created: number;
            failed: number;
            errors: string[];
        };
        message: string;
    }>;
    findAll(query: PilgrimQueryDto, req: any): Promise<{
        success: boolean;
        data: {
            pilgrims: ({
                booking: {
                    id: string;
                    customer: {
                        name: string;
                        id: string;
                    };
                    booking_code: string;
                };
            } & {
                name: string;
                email: string | null;
                id: string;
                tenant_id: string;
                phone: string | null;
                status: string;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                address: string | null;
                id_type: string;
                id_number: string;
                birth_date: Date;
                gender: string;
                customer_id: string;
                booking_id: string;
                birth_place: string;
                passport_number: string | null;
                passport_expiry: Date | null;
                family_relationship: string;
                emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
                room_number: string | null;
                building: string | null;
                floor: number | null;
                documents: import("@prisma/client/runtime/library").JsonValue[];
                document_completion: number;
            })[];
            total: number;
            pagination: {
                page: number;
                limit: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
        };
        message: string;
    }>;
    search(query: string, limit: number, req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            id: string;
            phone: string;
            id_number: string;
            booking_id: string;
            passport_number: string;
        }[];
        message: string;
    }>;
    getStats(req: any): Promise<{
        success: boolean;
        data: {
            total: any;
            byGender: any;
            byNationality: any;
            byMaritalStatus: any;
            recentCount: any;
        };
        message: string;
    }>;
    exportToExcel(query: PilgrimQueryDto, req: any, res: any): Promise<void>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: {
            booking: {
                id: string;
                package: {
                    name: string;
                    id: string;
                    code: string;
                };
                customer: {
                    name: string;
                    id: string;
                    phone: string;
                };
                booking_code: string;
            };
        } & {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            customer_id: string;
            booking_id: string;
            birth_place: string;
            passport_number: string | null;
            passport_expiry: Date | null;
            family_relationship: string;
            emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
            room_number: string | null;
            building: string | null;
            floor: number | null;
            documents: import("@prisma/client/runtime/library").JsonValue[];
            document_completion: number;
        };
        message: string;
    }>;
    update(id: string, updatePilgrimDto: UpdatePilgrimDto, req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            customer_id: string;
            booking_id: string;
            birth_place: string;
            passport_number: string | null;
            passport_expiry: Date | null;
            family_relationship: string;
            emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
            room_number: string | null;
            building: string | null;
            floor: number | null;
            documents: import("@prisma/client/runtime/library").JsonValue[];
            document_completion: number;
        };
        message: string;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    assignToBooking(pilgrimId: string, bookingId: string, req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            customer_id: string;
            booking_id: string;
            birth_place: string;
            passport_number: string | null;
            passport_expiry: Date | null;
            family_relationship: string;
            emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
            room_number: string | null;
            building: string | null;
            floor: number | null;
            documents: import("@prisma/client/runtime/library").JsonValue[];
            document_completion: number;
        };
        message: string;
    }>;
    removeFromBooking(pilgrimId: string, req: any): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string | null;
            status: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            customer_id: string;
            booking_id: string;
            birth_place: string;
            passport_number: string | null;
            passport_expiry: Date | null;
            family_relationship: string;
            emergency_contact: import("@prisma/client/runtime/library").JsonValue | null;
            room_number: string | null;
            building: string | null;
            floor: number | null;
            documents: import("@prisma/client/runtime/library").JsonValue[];
            document_completion: number;
        };
        message: string;
    }>;
}
