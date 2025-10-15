import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundPaymentDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly paymentGatewayService;
    constructor(paymentsService: PaymentsService, paymentGatewayService: PaymentGatewayService);
    create(createPaymentDto: CreatePaymentDto, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    createWithGateway(createPaymentDto: CreatePaymentDto, req: any): Promise<{
        success: boolean;
        data: {
            payment: {
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
            };
            gateway: import("./services/payment-gateway.service").PaymentGatewayResponse;
        };
        message: string;
    } | {
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getPaymentMethods(): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    syncPayment(id: string, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getProviderConfig(provider: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    handleWebhook(provider: string, headers: Record<string, string>, webhookData: any, req: any): Promise<{
        success: boolean;
        message: string;
        data?: never;
        error?: never;
    } | {
        success: boolean;
        data: any;
        message: string;
        error?: never;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: never;
    }>;
    findAll(query: PaymentQueryDto, req: any): Promise<{
        success: boolean;
        data: {
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
    getStats(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            completed: number;
            pending: number;
            failed: number;
            refunded: number;
            totalAmount: number;
            byMethod: {
                method: import(".prisma/client").$Enums.PaymentMethod;
                count: number;
                totalAmount: number;
            }[];
            byProvider: {
                provider: import(".prisma/client").$Enums.PaymentProvider;
                count: number;
                totalAmount: number;
            }[];
            recentCount: number;
        };
        message: string;
    }>;
    findOne(id: string, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    update(id: string, updatePaymentDto: UpdatePaymentDto, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    refund(id: string, refundDto: RefundPaymentDto, req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    cancel(id: string, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    retry(id: string, req: any): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
}
