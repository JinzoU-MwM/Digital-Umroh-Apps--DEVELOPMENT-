"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto, tenantId) {
        const { customer_id, booking_id, invoice_id } = createPaymentDto;
        const customer = await this.prisma.customer.findFirst({
            where: {
                id: customer_id,
                tenant_id: tenantId,
                deleted_at: null,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (booking_id) {
            const booking = await this.prisma.booking.findFirst({
                where: {
                    id: booking_id,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
            });
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
        }
        if (invoice_id) {
            const invoice = await this.prisma.invoice.findFirst({
                where: {
                    id: invoice_id,
                    tenant_id: tenantId,
                    deleted_at: null,
                },
            });
            if (!invoice) {
                throw new common_1.NotFoundException('Invoice not found');
            }
        }
        const payment = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.payment.create({
                data: {
                    tenant_id: tenantId,
                    customer_id: createPaymentDto.customer_id,
                    booking_id: createPaymentDto.booking_id,
                    invoice_id: createPaymentDto.invoice_id,
                    amount: createPaymentDto.amount,
                    method: createPaymentDto.method,
                    provider: createPaymentDto.provider,
                    external_transaction_id: createPaymentDto.external_transaction_id,
                    reference_number: createPaymentDto.reference_number,
                    description: createPaymentDto.description,
                    notes: createPaymentDto.notes,
                    payment_date: createPaymentDto.payment_date
                        ? new Date(createPaymentDto.payment_date)
                        : new Date(),
                    currency: createPaymentDto.currency || 'IDR',
                    exchange_rate: createPaymentDto.exchange_rate || 1,
                    status: client_1.PaymentStatus.PENDING,
                    metadata: createPaymentDto.metadata
                        ? JSON.parse(JSON.stringify(createPaymentDto.metadata))
                        : {},
                },
            });
        });
        return payment;
    }
    async findAll(query, tenantId, currentUser) {
        const { page = 1, limit = 20, search, status, method, provider, customer_id, booking_id, invoice_id, date_from, date_to, amount_min, amount_max, sortBy = 'created_at', sortOrder = 'desc', } = query;
        const offset = (page - 1) * limit;
        const where = {
            deleted_at: null,
        };
        if (search) {
            where.OR = [
                { reference_number: { contains: search, mode: 'insensitive' } },
                { external_transaction_id: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (method) {
            where.method = method;
        }
        if (provider) {
            where.provider = provider;
        }
        if (customer_id) {
            where.customer_id = customer_id;
        }
        if (booking_id) {
            where.booking_id = booking_id;
        }
        if (invoice_id) {
            where.invoice_id = invoice_id;
        }
        if (date_from || date_to) {
            where.payment_date = {};
            if (date_from) {
                where.payment_date.gte = new Date(date_from);
            }
            if (date_to) {
                where.payment_date.lte = new Date(date_to);
            }
        }
        if (amount_min || amount_max) {
            where.amount = {};
            if (amount_min) {
                where.amount.gte = amount_min;
            }
            if (amount_max) {
                where.amount.lte = amount_max;
            }
        }
        const total = await this.prisma.payment.count({ where });
        const payments = await this.prisma.payment.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                booking: {
                    select: {
                        id: true,
                        booking_code: true,
                        package: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
                invoice: {
                    select: {
                        id: true,
                        invoice_number: true,
                        issue_date: true,
                        due_date: true,
                        total_amount: true,
                        paid_amount: true,
                        status: true,
                    },
                },
            },
        });
        return {
            payments,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    }
    async findOne(id, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                deleted_at: null,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                booking: {
                    select: {
                        id: true,
                        booking_code: true,
                        package: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
                invoice: {
                    select: {
                        id: true,
                        invoice_number: true,
                        issue_date: true,
                        due_date: true,
                        total_amount: true,
                        paid_amount: true,
                        status: true,
                    },
                },
                refunds: true,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async update(id, updatePaymentDto, tenantId, currentUser) {
        const existingPayment = await this.prisma.payment.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!existingPayment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        const payment = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.payment.update({
                where: { id },
                data: {
                    status: updatePaymentDto.status,
                    method: updatePaymentDto.method,
                    provider: updatePaymentDto.provider,
                    external_transaction_id: updatePaymentDto.external_transaction_id,
                    reference_number: updatePaymentDto.reference_number,
                    description: updatePaymentDto.description,
                    notes: updatePaymentDto.notes,
                    payment_date: updatePaymentDto.payment_date
                        ? new Date(updatePaymentDto.payment_date)
                        : undefined,
                    currency: updatePaymentDto.currency,
                    exchange_rate: updatePaymentDto.exchange_rate,
                    metadata: updatePaymentDto.metadata
                        ? JSON.parse(JSON.stringify(updatePaymentDto.metadata))
                        : undefined,
                },
            });
        });
        return payment;
    }
    async refund(id, refundDto, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Only completed payments can be refunded');
        }
        if (refundDto.amount > payment.amount) {
            throw new common_1.BadRequestException('Refund amount cannot exceed payment amount');
        }
        const refund = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.refund.create({
                data: {
                    tenant_id: tenantId,
                    payment_id: id,
                    amount: refundDto.amount,
                    reason: refundDto.reason,
                    notes: refundDto.notes,
                    external_refund_id: refundDto.external_refund_id,
                    status: 'PENDING',
                },
            });
        });
        const totalRefunded = await this.prisma.refund.aggregate({
            where: {
                payment_id: id,
                status: 'COMPLETED',
            },
            _sum: { amount: true },
        });
        const refundedAmount = totalRefunded._sum.amount || 0;
        if (refundedAmount + refundDto.amount >= payment.amount) {
            await this.prisma.payment.update({
                where: { id },
                data: { status: client_1.PaymentStatus.REFUNDED },
            });
        }
        return refund;
    }
    async getStats(tenantId) {
        const [totalPayments, completedPayments, pendingPayments, failedPayments, refundedPayments, totalAmount, paymentsByMethod, paymentsByProvider, recentPayments,] = await Promise.all([
            this.prisma.payment.count({
                where: { deleted_at: null },
            }),
            this.prisma.payment.count({
                where: { status: client_1.PaymentStatus.COMPLETED, deleted_at: null },
            }),
            this.prisma.payment.count({
                where: { status: client_1.PaymentStatus.PENDING, deleted_at: null },
            }),
            this.prisma.payment.count({
                where: { status: client_1.PaymentStatus.FAILED, deleted_at: null },
            }),
            this.prisma.payment.count({
                where: { status: client_1.PaymentStatus.REFUNDED, deleted_at: null },
            }),
            this.prisma.payment.aggregate({
                where: { deleted_at: null },
                _sum: { amount: true },
            }),
            this.prisma.payment.groupBy({
                by: ['method'],
                where: { deleted_at: null },
                _count: { method: true },
                _sum: { amount: true },
            }),
            this.prisma.payment.groupBy({
                by: ['provider'],
                where: { deleted_at: null },
                _count: { provider: true },
                _sum: { amount: true },
            }),
            this.prisma.payment.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                    deleted_at: null,
                },
            }),
        ]);
        return {
            total: totalPayments,
            completed: completedPayments,
            pending: pendingPayments,
            failed: failedPayments,
            refunded: refundedPayments,
            totalAmount: totalAmount._sum.amount || 0,
            byMethod: paymentsByMethod.map(item => ({
                method: item.method,
                count: item._count.method,
                totalAmount: item._sum.amount || 0,
            })),
            byProvider: paymentsByProvider.map(item => ({
                provider: item.provider,
                count: item._count.provider,
                totalAmount: item._sum.amount || 0,
            })),
            recentCount: recentPayments,
        };
    }
    async processWebhook(provider, webhookData, tenantId) {
        const { external_transaction_id, status, amount, event_type, data } = webhookData;
        const payment = await this.prisma.payment.findFirst({
            where: {
                external_transaction_id,
                deleted_at: null,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found for webhook processing');
        }
        const updateData = {
            status,
            metadata: data
                ? JSON.parse(JSON.stringify(data))
                : payment.metadata,
        };
        const updatedPayment = await this.prisma.withTenant(payment.tenant_id, async () => {
            return this.prisma.payment.update({
                where: { id: payment.id },
                data: updateData,
            });
        });
        if (status === client_1.PaymentStatus.COMPLETED && payment.invoice_id) {
            await this.updateInvoicePaidAmount(payment.invoice_id);
        }
        return updatedPayment;
    }
    async cancel(id, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === client_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel completed payment');
        }
        if (payment.status === client_1.PaymentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Payment is already cancelled');
        }
        if (payment.status === client_1.PaymentStatus.REFUNDED) {
            throw new common_1.BadRequestException('Cannot cancel refunded payment');
        }
        const updatedPayment = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.payment.update({
                where: { id },
                data: { status: client_1.PaymentStatus.CANCELLED },
            });
        });
        return updatedPayment;
    }
    async retry(id, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.FAILED &&
            payment.status !== client_1.PaymentStatus.CANCELLED &&
            payment.status !== client_1.PaymentStatus.EXPIRED) {
            throw new common_1.BadRequestException('Only failed, cancelled, or expired payments can be retried');
        }
        const updatedPayment = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.payment.update({
                where: { id },
                data: { status: client_1.PaymentStatus.PENDING },
            });
        });
        return updatedPayment;
    }
    async updateInvoicePaidAmount(invoiceId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                invoice_id: invoiceId,
                status: client_1.PaymentStatus.COMPLETED,
                deleted_at: null,
            },
        });
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { paid_amount: totalPaid },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map