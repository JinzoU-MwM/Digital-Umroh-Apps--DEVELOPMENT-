import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundPaymentDto, PaymentWebhookDto } from './dto/payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, tenantId: string) {
    const { customer_id, booking_id, invoice_id } = createPaymentDto;

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

    // Validate invoice exists if provided
    if (invoice_id) {
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: invoice_id,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    }

    // Create payment
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
          status: PaymentStatus.PENDING,
          metadata: createPaymentDto.metadata
            ? JSON.parse(JSON.stringify(createPaymentDto.metadata))
            : {},
        },
      });
    });

    return payment;
  }

  async findAll(query: PaymentQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      method,
      provider,
      customer_id,
      booking_id,
      invoice_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
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

    // Get total count
    const total = await this.prisma.payment.count({ where });

    // Get payments with pagination
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

  async findOne(id: string, tenantId: string) {
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
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, tenantId: string, currentUser: any) {
    // Check if payment exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment
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

  async refund(id: string, refundDto: RefundPaymentDto, tenantId: string) {
    // Check if payment exists
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (refundDto.amount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Create refund
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

    // Update payment status if fully refunded
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
        data: { status: PaymentStatus.REFUNDED },
      });
    }

    return refund;
  }

  async getStats(tenantId: string) {
    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalAmount,
      paymentsByMethod,
      paymentsByProvider,
      recentPayments,
    ] = await Promise.all([
      this.prisma.payment.count({
        where: { deleted_at: null },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.COMPLETED, deleted_at: null },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.PENDING, deleted_at: null },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.FAILED, deleted_at: null },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.REFUNDED, deleted_at: null },
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
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

  async processWebhook(provider: string, webhookData: PaymentWebhookDto, tenantId?: string) {
    const { external_transaction_id, status, amount, event_type, data } = webhookData;

    // Find payment by external transaction ID
    const payment = await this.prisma.payment.findFirst({
      where: {
        external_transaction_id,
        deleted_at: null,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for webhook processing');
    }

    // Update payment status based on webhook
    const updateData: any = {
      status,
      metadata: data
        ? JSON.parse(JSON.stringify(data))
        : payment.metadata,
    };

    // Update payment status
    const updatedPayment = await this.prisma.withTenant(payment.tenant_id, async () => {
      return this.prisma.payment.update({
        where: { id: payment.id },
        data: updateData,
      });
    });

    // If payment is completed, update invoice paid amount if linked to invoice
    if (status === PaymentStatus.COMPLETED && payment.invoice_id) {
      await this.updateInvoicePaidAmount(payment.invoice_id);
    }

    return updatedPayment;
  }

  async cancel(id: string, tenantId: string) {
    // Check if payment exists
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed payment');
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('Payment is already cancelled');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Cannot cancel refunded payment');
    }

    // Update payment status
    const updatedPayment = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.payment.update({
        where: { id },
        data: { status: PaymentStatus.CANCELLED },
      });
    });

    return updatedPayment;
  }

  async retry(id: string, tenantId: string) {
    // Check if payment exists
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.FAILED &&
        payment.status !== PaymentStatus.CANCELLED &&
        payment.status !== PaymentStatus.EXPIRED) {
      throw new BadRequestException('Only failed, cancelled, or expired payments can be retried');
    }

    // Reset payment status to pending for retry
    const updatedPayment = await this.prisma.withTenant(tenantId, async () => {
      return this.prisma.payment.update({
        where: { id },
        data: { status: PaymentStatus.PENDING },
      });
    });

    // TODO: Implement actual payment retry logic based on provider
    // This would involve calling the payment provider's API to retry the payment

    return updatedPayment;
  }

  private async updateInvoicePaidAmount(invoiceId: string) {
    // Get all completed payments for the invoice
    const payments = await this.prisma.payment.findMany({
      where: {
        invoice_id: invoiceId,
        status: PaymentStatus.COMPLETED,
        deleted_at: null,
      },
    });

    // Calculate total paid amount
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Update invoice paid amount
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paid_amount: totalPaid },
    });
  }
}