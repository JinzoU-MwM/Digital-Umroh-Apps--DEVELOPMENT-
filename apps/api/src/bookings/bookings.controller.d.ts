import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, BookingQueryDto } from './dto/booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, tenantId: string, req: any): Promise<{
        data: {
            package: {
                name: string;
                id: string;
                code: string;
            };
            customer: {
                name: string;
                email: string;
                id: string;
                phone: string;
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
        };
        message: string;
    }>;
    findAll(query: BookingQueryDto, tenantId: string, req: any): Promise<{
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
            customer: {
                name: string;
                email: string;
                id: string;
                phone: string;
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
        data: ({
            package: {
                name: string;
                id: string;
                code: string;
            };
            customer: {
                name: string;
                id: string;
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
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        data: {
            pilgrims: {
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
            }[];
            invoices: {
                id: string;
                tenant_id: string;
                status: import(".prisma/client").$Enums.InvoiceStatus;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                terms: string | null;
                notes: string | null;
                customer_id: string;
                tax_amount: number;
                discount_amount: number;
                remaining_amount: number;
                created_by: string;
                booking_id: string;
                invoice_number: string;
                issue_date: Date;
                due_date: Date;
                paid_date: Date | null;
                items: import("@prisma/client/runtime/library").JsonValue[];
                subtotal: number;
                total_amount: number;
                paid_amount: number;
            }[];
            payments: {
                method: import(".prisma/client").$Enums.PaymentMethod;
                id: string;
                tenant_id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                created_at: Date;
                updated_at: Date;
                deleted_at: Date | null;
                amount: number;
                notes: string | null;
                created_by: string;
                booking_id: string | null;
                invoice_id: string;
                provider: import(".prisma/client").$Enums.PaymentProvider;
                provider_reference: string | null;
                paid_at: Date | null;
                provider_response: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
            package: {
                name: string;
                id: string;
                code: string;
            };
            customer: {
                name: string;
                email: string;
                id: string;
                phone: string;
            };
            creator: {
                name: string;
                id: string;
            };
            updater: {
                name: string;
                id: string;
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
        };
        message: string;
    }>;
    getPilgrims(id: string, tenantId: string): Promise<{
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
        }[];
        message: string;
    }>;
    update(id: string, updateBookingDto: UpdateBookingDto, tenantId: string, req: any): Promise<{
        data: {
            package: {
                name: string;
                id: string;
                code: string;
            };
            customer: {
                name: string;
                id: string;
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
        };
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    confirm(id: string, tenantId: string): Promise<{
        data: {
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
        };
        message: string;
    }>;
    cancel(id: string, body: {
        reason?: string;
    }, tenantId: string): Promise<{
        data: {
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
        };
        message: string;
    }>;
    complete(id: string, tenantId: string): Promise<{
        data: {
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
        };
        message: string;
    }>;
    addPilgrims(id: string, body: {
        pilgrims: any[];
    }, tenantId: string): Promise<{
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
        }[];
        message: string;
    }>;
    getStats(query: any, tenantId: string): Promise<{
        data: {
            total: number;
            byStatus: {
                status: import(".prisma/client").$Enums.BookingStatus;
                count: number;
            }[];
            byPaymentStatus: {
                status: import(".prisma/client").$Enums.PaymentStatus;
                count: number;
            }[];
            recentCount: number;
            totalRevenue: number;
            topPackages: {
                package_id: string;
                count: number;
            }[];
        };
        message: string;
    }>;
    exportToExcel(query: BookingQueryDto, tenantId: string): Promise<{
        data: import("exceljs").Buffer;
        message: string;
    }>;
    sendNotifications(id: string, body: {
        type: 'CONFIRMATION' | 'REMINDER' | 'UPDATE';
    }, tenantId: string): Promise<{
        message: string;
    }>;
    getCalendar(year: number, month: number, tenantId: string): Promise<{
        data: {
            id: string;
            title: string;
            date: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            customerName: string;
            packageCode: string;
        }[];
        message: string;
    }>;
}
