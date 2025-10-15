import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto, tenantId: string) {
    const { customer_id, booking_id, items } = createInvoiceDto;

    // Validate customer exists
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customer_id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate booking exists if provided
    if (booking_id) {
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: booking_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
    }

    // Calculate invoice totals
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

    // Create invoice
    const invoice = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.invoice.create({
        data: {
          tenant_id: tenantId,
          customer_id: createInvoiceDto.customer_id,
          booking_id: createInvoiceDto.booking_id,
          invoice_number: createInvoiceDto.invoice_number,
          issue_date: new Date(createInvoiceDto.issue_date),
          due_date: new Date(createInvoiceDto.due_date),
          status: InvoiceStatus.DRAFT,
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

  async findAll(query: InvoiceQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      customer_id,
      booking_id,
      date_from,
      date_to,
      due_date_from,
      due_date_to,
      overdue_status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
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
        where.status = { not: InvoiceStatus.PAID };
      } else if (overdue_status === 'due_soon') {
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        where.due_date = {
          gte: now,
          lte: threeDaysFromNow
        };
        where.status = { not: InvoiceStatus.PAID };
      } else if (overdue_status === 'on_time') {
        where.due_date = { gt: now };
        where.status = { not: InvoiceStatus.PAID };
      }
    }

    // Get total count
    const total = await this.prisma.invoice.count({ where });

    // Get invoices with pagination
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

  async findOne(id: string, tenantId: string) {
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
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, tenantId: string, currentUser: any) {
    // Check if invoice exists
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: { items: true },
    });

    if (!existingInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if invoice can be updated (not paid or cancelled)
    if (existingInvoice.status === InvoiceStatus.PAID || existingInvoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot update paid or cancelled invoice');
    }

    // Update invoice
    const updateData: any = {
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

    // Recalculate totals if items are updated
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

      // Update items
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

  async cancel(id: string, tenantId: string) {
    // Check if invoice exists
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid invoice');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    // Update invoice status
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });

    return updatedInvoice;
  }

  async sendInvoice(id: string, tenantId: string) {
    // Check if invoice exists
    const invoice = await this.findOne(id, tenantId);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot send cancelled invoice');
    }

    // Update invoice status to sent
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
    });

    // TODO: Implement email sending functionality
    // This would involve creating an email service and sending the invoice to the customer

    return updatedInvoice;
  }

  async getStats(tenantId: string) {
    const [
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      overdueInvoices,
      cancelledInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.invoice.count({
        where: { deleted_at: null },
      }),
      this.prisma.invoice.count({
        where: { status: InvoiceStatus.DRAFT, deleted_at: null },
      }),
      this.prisma.invoice.count({
        where: { status: InvoiceStatus.SENT, deleted_at: null },
      }),
      this.prisma.invoice.count({
        where: { status: InvoiceStatus.PAID, deleted_at: null },
      }),
      this.prisma.invoice.count({
        where: {
          status: { not: InvoiceStatus.PAID },
          due_date: { lt: new Date() },
          deleted_at: null,
        },
      }),
      this.prisma.invoice.count({
        where: { status: InvoiceStatus.CANCELLED, deleted_at: null },
      }),
      this.prisma.invoice.aggregate({
        where: { deleted_at: null },
        _sum: { total_amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID, deleted_at: null },
        _sum: { paid_amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          status: { not: InvoiceStatus.PAID },
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
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
}