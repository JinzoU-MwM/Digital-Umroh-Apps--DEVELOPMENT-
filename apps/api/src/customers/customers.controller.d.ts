import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, tenantId: string): Promise<{
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
        };
        message: string;
    }>;
    findAll(query: CustomerQueryDto, tenantId: string, req: any): Promise<{
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
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
    search(query: string, limit: number, tenantId: string): Promise<{
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
        }[];
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        data: {
            _count: {
                bookings: number;
                pilgrims: number;
            };
        } & {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
        };
        message: string;
    }>;
    getBookingHistory(id: string, query: any, tenantId: string): Promise<{
        data: ({
            _count: {
                pilgrims: number;
            };
            package: {
                name: string;
                id: string;
                code: string;
                period_from: Date;
                period_to: Date;
            };
        } & {
            id: string;
            tenant_id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            room_type: import(".prisma/client").$Enums.RoomType;
            notes: string | null;
            customer_id: string;
            package_id: string;
            booking_code: string;
            payment_status: import(".prisma/client").$Enums.PaymentStatus;
            number_of_pilgrims: number;
            special_requests: string | null;
            base_price: number;
            tax_amount: number;
            additional_fees: number;
            discount_amount: number;
            total_price: number;
            dp_amount: number;
            dp_paid: number;
            remaining_amount: number;
            remaining_paid: number;
            total_paid: number;
            booking_date: Date;
            confirmation_date: Date | null;
            payment_complete_date: Date | null;
            departure_date: Date;
            return_date: Date;
            created_by: string;
            updated_by: string | null;
        })[];
        meta: {
            pagination: {
                page: any;
                limit: any;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
            total: number;
        };
        message: string;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string, req: any): Promise<{
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
        };
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    import(importData: {
        customers: any[];
    }, tenantId: string): Promise<{
        data: {
            imported: number;
            failed: number;
            errors: string[];
        };
        message: string;
    }>;
    exportToExcel(query: CustomerQueryDto, tenantId: string): Promise<{
        data: import("exceljs").Buffer;
        message: string;
    }>;
    getStats(tenantId: string): Promise<{
        data: {
            total: number;
            byGender: {
                gender: string;
                count: number;
            }[];
            byNationality: {
                nationality: string;
                count: number;
            }[];
            recentCount: number;
            topCompanies: {
                company: string;
                count: number;
            }[];
        };
        message: string;
    }>;
    merge(primaryId: string, body: {
        duplicateId: string;
    }, tenantId: string): Promise<{
        data: {
            name: string;
            email: string | null;
            id: string;
            tenant_id: string;
            phone: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            id_type: string;
            id_number: string;
            birth_date: Date;
            gender: string;
            nationality: string;
            company: string | null;
        };
        message: string;
    }>;
    findDuplicates(tenantId: string): Promise<{
        data: {
            phoneDuplicates: {
                name: string;
                email: string;
                id: string;
                phone: string;
                created_at: Date;
            }[][];
            idNumberDuplicates: {
                name: string;
                email: string;
                id: string;
                created_at: Date;
                id_number: string;
            }[][];
        };
        message: string;
    }>;
}
