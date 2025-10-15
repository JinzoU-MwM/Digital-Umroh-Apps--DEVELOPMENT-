import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';
import * as ExcelJS from 'exceljs';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto, tenantId: string): Promise<{
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
    }>;
    findAll(query: CustomerQueryDto, tenantId: string, currentUser: any): Promise<{
        customers: {
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
        total: number;
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    search(query: string, limit: number, tenantId: string): Promise<{
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
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
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
    }>;
    getBookingHistory(id: string, query: any, tenantId: string): Promise<{
        bookings: ({
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
        total: number;
        pagination: {
            page: any;
            limit: any;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, tenantId: string, currentUser: any): Promise<{
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
    }>;
    remove(id: string, tenantId: string): Promise<void>;
    importCustomers(customersData: any[], tenantId: string): Promise<{
        imported: number;
        failed: number;
        errors: string[];
    }>;
    exportToExcel(query: CustomerQueryDto, tenantId: string): Promise<ExcelJS.Buffer>;
    getStats(tenantId: string): Promise<{
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
    }>;
    mergeCustomers(primaryId: string, duplicateId: string, tenantId: string): Promise<{
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
    }>;
    findDuplicates(tenantId: string): Promise<{
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
    }>;
}
