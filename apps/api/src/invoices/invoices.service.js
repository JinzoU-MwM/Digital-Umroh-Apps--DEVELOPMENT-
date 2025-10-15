"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const client_1 = require("@prisma/client");
let InvoicesService = class InvoicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createInvoiceDto, tenantId) {
        const { customer_id, booking_id, items } = createInvoiceDto;
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
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        const invoiceItems = items.map(item => {
            const itemTotal = item.quantity * item.unit_price;
            const itemDiscount = item.discount || 0;
            const itemTax = item.tax || 0;
            const itemSubtotal = itemTotal - itemDiscount + itemTax;
            subtotal += itemSubtotal;
            totalTax += itemTax;
            totalDiscount += itemDiscount;
            return {
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: itemDiscount,
                tax: itemTax,
                total: itemSubtotal,
            };
        });
        const totalAmount = subtotal + (createInvoiceDto.tax_rate || 0) * subtotal / 100 - (createInvoiceDto.discount_amount || 0);
        const invoice = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.invoice.create({
                data: {
                    tenant_id: tenantId,
                    customer_id: createInvoiceDto.customer_id,
                    booking_id: createInvoiceDto.booking_id,
                    invoice_number: createInvoiceDto.invoice_number,
                    issue_date: new Date(createInvoiceDto.issue_date),
                    due_date: new Date(createInvoiceDto.due_date),
                    status: client_1.InvoiceStatus.DRAFT,
                    subtotal,
                    tax_amount: totalTax,
                    discount_amount: totalDiscount + (createInvoiceDto.discount_amount || 0),
                    total_amount: totalAmount,
                    paid_amount: 0,
                    notes: createInvoiceDto.notes,
                    billing_address: createInvoiceDto.billing_address,
                    billing_email: createInvoiceDto.billing_email,
                    billing_phone: createInvoiceDto.billing_phone,
                    tax_rate: createInvoiceDto.tax_rate || 0,
                    payment_terms: createInvoiceDto.payment_terms || 30,
                    late_fee_percentage: createInvoiceDto.late_fee_percentage || 0,
                    custom_fields: createInvoiceDto.custom_fields
                        ? JSON.parse(JSON.stringify(createInvoiceDto.custom_fields))
                        : {},
                    items: {
                        create: invoiceItems,
                    },
                },
                include: {
                    items: true,
                },
            });
        });
        return invoice;
    }
    async findAll(query, tenantId, currentUser) {
        const { page = 1, limit = 20, search, status, customer_id, booking_id, date_from, date_to, due_date_from, due_date_to, overdue_status, sortBy = 'created_at', sortOrder = 'desc', } = query;
        const offset = (page - 1) * limit;
        const where = {
            deleted_at: null,
        };
        if (search) {
            where.OR = [
                { invoice_number: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { billing_email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (customer_id) {
            where.customer_id = customer_id;
        }
        if (booking_id) {
            where.booking_id = booking_id;
        }
        if (date_from || date_to) {
            where.issue_date = {};
            if (date_from) {
                where.issue_date.gte = new Date(date_from);
            }
            if (date_to) {
                where.issue_date.lte = new Date(date_to);
            }
        }
        if (due_date_from || due_date_to) {
            where.due_date = {};
            if (due_date_from) {
                where.due_date.gte = new Date(due_date_from);
            }
            if (due_date_to) {
                where.due_date.lte = new Date(due_date_to);
            }
        }
        if (overdue_status) {
            const now = new Date();
            if (overdue_status === 'overdue') {
                where.due_date = { lt: now };
                where.status = { not: client_1.InvoiceStatus.PAID };
            }
            else if (overdue_status === 'due_soon') {
                const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                where.due_date = {
                    gte: now,
                    lte: threeDaysFromNow
                };
                where.status = { not: client_1.InvoiceStatus.PAID };
            }
            else if (overdue_status === 'on_time') {
                where.due_date = { gt: now };
                where.status = { not: client_1.InvoiceStatus.PAID };
            }
        }
        const total = await this.prisma.invoice.count({ where });
        const invoices = await this.prisma.invoice.findMany({
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
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        payment_date: true,
                        method: true,
                    },
                },
                items: true,
            },
        });
        return {
            invoices,
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
        const invoice = await this.prisma.invoice.findFirst({
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
                        address: true,
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
                                duration: true,
                            },
                        },
                    },
                },
                payments: {
                    include: {
                        refunds: true,
                    },
                },
                items: true,
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return invoice;
    }
    async update(id, updateInvoiceDto, tenantId, currentUser) {
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                deleted_at: null,
            },
            include: { items: true },
        });
        if (!existingInvoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (existingInvoice.status === client_1.InvoiceStatus.PAID || existingInvoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update paid or cancelled invoice');
        }
        const updateData = {
            customer_id: updateInvoiceDto.customer_id,
            booking_id: updateInvoiceDto.booking_id,
            invoice_number: updateInvoiceDto.invoice_number,
            issue_date: updateInvoiceDto.issue_date
                ? new Date(updateInvoiceDto.issue_date)
                : undefined,
            due_date: updateInvoiceDto.due_date
                ? new Date(updateInvoiceDto.due_date)
                : undefined,
            status: updateInvoiceDto.status,
            notes: updateInvoiceDto.notes,
            billing_address: updateInvoiceDto.billing_address,
            billing_email: updateInvoiceDto.billing_email,
            billing_phone: updateInvoiceDto.billing_phone,
            tax_rate: updateInvoiceDto.tax_rate,
            discount_amount: updateInvoiceDto.discount_amount,
            payment_terms: updateInvoiceDto.payment_terms,
            late_fee_percentage: updateInvoiceDto.late_fee_percentage,
            custom_fields: updateInvoiceDto.custom_fields
                ? JSON.parse(JSON.stringify(updateInvoiceDto.custom_fields))
                : undefined,
        };
        if (updateInvoiceDto.items) {
            let subtotal = 0;
            let totalTax = 0;
            let totalDiscount = 0;
            const invoiceItems = updateInvoiceDto.items.map(item => {
                const itemTotal = item.quantity * item.unit_price;
                const itemDiscount = item.discount || 0;
                const itemTax = item.tax || 0;
                const itemSubtotal = itemTotal - itemDiscount + itemTax;
                subtotal += itemSubtotal;
                totalTax += itemTax;
                totalDiscount += itemDiscount;
                return {
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount: itemDiscount,
                    tax: itemTax,
                    total: itemSubtotal,
                };
            });
            const totalAmount = subtotal + (updateInvoiceDto.tax_rate || 0) * subtotal / 100 - (updateInvoiceDto.discount_amount || 0);
            updateData.subtotal = subtotal;
            updateData.tax_amount = totalTax;
            updateData.discount_amount = totalDiscount + (updateInvoiceDto.discount_amount || 0);
            updateData.total_amount = totalAmount;
            await this.prisma.invoiceItem.deleteMany({
                where: { invoice_id: id },
            });
            updateData.items = {
                create: invoiceItems,
            };
        }
        const invoice = await this.prisma.withTenant(tenantId, async () => {
            return this.prisma.invoice.update({
                where: { id },
                data: updateData,
                include: {
                    items: true,
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
        });
        return invoice;
    }
    async cancel(id, tenantId) {
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Cannot cancel paid invoice');
        }
        if (invoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('Invoice is already cancelled');
        }
        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: { status: client_1.InvoiceStatus.CANCELLED },
        });
        return updatedInvoice;
    }
    async sendInvoice(id, tenantId) {
        const invoice = await this.findOne(id, tenantId);
        if (invoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot send cancelled invoice');
        }
        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: { status: client_1.InvoiceStatus.SENT },
        });
        return updatedInvoice;
    }
    async getStats(tenantId) {
        const [totalInvoices, draftInvoices, sentInvoices, paidInvoices, overdueInvoices, cancelledInvoices, totalAmount, paidAmount, outstandingAmount, recentInvoices,] = await Promise.all([
            this.prisma.invoice.count({
                where: { deleted_at: null },
            }),
            this.prisma.invoice.count({
                where: { status: client_1.InvoiceStatus.DRAFT, deleted_at: null },
            }),
            this.prisma.invoice.count({
                where: { status: client_1.InvoiceStatus.SENT, deleted_at: null },
            }),
            this.prisma.invoice.count({
                where: { status: client_1.InvoiceStatus.PAID, deleted_at: null },
            }),
            this.prisma.invoice.count({
                where: {
                    status: { not: client_1.InvoiceStatus.PAID },
                    due_date: { lt: new Date() },
                    deleted_at: null,
                },
            }),
            this.prisma.invoice.count({
                where: { status: client_1.InvoiceStatus.CANCELLED, deleted_at: null },
            }),
            this.prisma.invoice.aggregate({
                where: { deleted_at: null },
                _sum: { total_amount: true },
            }),
            this.prisma.invoice.aggregate({
                where: { status: client_1.InvoiceStatus.PAID, deleted_at: null },
                _sum: { paid_amount: true },
            }),
            this.prisma.invoice.aggregate({
                where: {
                    status: { not: client_1.InvoiceStatus.PAID },
                    deleted_at: null,
                },
                _sum: {
                    total_amount: true,
                    paid_amount: true,
                },
            }),
            this.prisma.invoice.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                    deleted_at: null,
                },
            }),
        ]);
        const totalAmountSum = totalAmount._sum.total_amount || 0;
        const paidAmountSum = paidAmount._sum.paid_amount || 0;
        const outstandingAmountSum = outstandingAmount._sum.total_amount || 0;
        const outstandingPaidAmountSum = outstandingAmount._sum.paid_amount || 0;
        return {
            total: totalInvoices,
            draft: draftInvoices,
            sent: sentInvoices,
            paid: paidInvoices,
            overdue: overdueInvoices,
            cancelled: cancelledInvoices,
            totalAmount: totalAmountSum,
            paidAmount: paidAmountSum,
            outstandingAmount: outstandingAmountSum - outstandingPaidAmountSum,
            recentCount: recentInvoices,
        };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map