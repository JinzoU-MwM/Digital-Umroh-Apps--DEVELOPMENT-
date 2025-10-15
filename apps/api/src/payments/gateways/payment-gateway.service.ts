import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { XenditService, XenditInvoiceResponse } from './xendit.service';
import { MidtransService, MidtransTransactionResponse } from './midtrans.service';
import { PaymentProvider, PaymentStatus, PaymentMethod } from '@prisma/client';

export interface CreatePaymentLinkRequest {
  invoiceId: string;
  amount: number;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  successUrl?: string;
  failureUrl?: string;
  expiryHours?: number;
  preferredProvider?: 'XENDIT' | 'MIDTRANS';
  paymentMethods?: PaymentMethod[];
}

export interface PaymentLinkResponse {
  id: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  paymentUrl: string;
  status: PaymentStatus;
  amount: number;
  expiresAt?: Date;
  metadata?: any;
}

export interface PaymentStatusUpdate {
  providerPaymentId: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: Date;
  paidAmount?: number;
  failureReason?: string;
  metadata?: any;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly defaultProvider: PaymentProvider;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private xenditService: XenditService,
    private midtransService: MidtransService,
  ) {
    this.defaultProvider = (this.configService.get<string>('DEFAULT_PAYMENT_PROVIDER') || 'XENDIT') as PaymentProvider;
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  async createPaymentLink(request: CreatePaymentLinkRequest, tenantId: string, createdBy: string): Promise<PaymentLinkResponse> {
    try {
      this.logger.log(`Creating payment link for invoice ${request.invoiceId}, amount: ${request.amount}`);

      // Get invoice details
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: request.invoiceId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: {
          customer: true,
          booking: {
            include: {
              package: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
      }

      // Generate unique external ID
      const externalId = this.generateExternalId(invoice.invoice_number);

      // Select provider
      const provider = request.preferredProvider as PaymentProvider || this.defaultProvider;

      // Prepare success and failure URLs
      const successUrl = request.successUrl || `${this.baseUrl}/payment/success?invoice=${invoice.invoice_number}`;
      const failureUrl = request.failureUrl || `${this.baseUrl}/payment/failure?invoice=${invoice.invoice_number}`;

      let paymentResponse: PaymentLinkResponse;

      if (provider === 'XENDIT') {
        paymentResponse = await this.createXenditPaymentLink({
          ...request,
          externalId,
          successUrl,
          failureUrl,
          invoice,
        });
      } else if (provider === 'MIDTRANS') {
        paymentResponse = await this.createMidtransPaymentLink({
          ...request,
          externalId,
          successUrl,
          failureUrl,
          invoice,
        });
      } else {
        throw new HttpException('Unsupported payment provider', HttpStatus.BAD_REQUEST);
      }

      // Create payment record in database
      const payment = await this.prisma.withTenant(tenantId, async () => {
        return this.prisma.payment.create({
          data: {
            tenant_id: tenantId,
            customer_id: invoice.customer_id,
            invoice_id: invoice.id,
            booking_id: invoice.booking_id,
            amount: request.amount,
            method: this.mapPaymentMethod(paymentResponse.paymentMethod),
            provider: paymentResponse.provider,
            provider_reference: paymentResponse.providerPaymentId,
            description: request.description,
            status: paymentResponse.status,
            external_transaction_id: externalId,
            metadata: {
              payment_url: paymentResponse.paymentUrl,
              expires_at: paymentResponse.expiresAt,
              provider_data: paymentResponse.metadata,
            },
            created_by: createdBy,
          },
        });
      });

      // Send payment link notification
      await this.sendPaymentLinkNotification(invoice, paymentResponse, tenantId);

      this.logger.log(`Successfully created payment link: ${payment.id} via ${provider}`);

      return {
        ...paymentResponse,
        id: payment.id,
        status: payment.status,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment link: ${error.message}`);
      throw error;
    }
  }

  async updatePaymentStatus(update: PaymentStatusUpdate, tenantId?: string): Promise<void> {
    try {
      this.logger.log(`Updating payment status for ${update.providerPaymentId} to ${update.status}`);

      // Find payment by provider reference
      const payment = await this.prisma.payment.findFirst({
        where: {
          provider_reference: update.providerPaymentId,
          deleted_at: null,
        },
        include: {
          invoice: true,
          customer: true,
          booking: true,
        },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for provider reference: ${update.providerPaymentId}`);
        return;
      }

      // Update payment status
      const updatedPayment = await this.prisma.withTenant(payment.tenant_id, async () => {
        return this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: update.status,
            paid_at: update.paidAt,
            metadata: {
              ...payment.metadata,
              payment_method: update.paymentMethod,
              paid_amount: update.paidAmount,
              failure_reason: update.failureReason,
              updated_at: new Date(),
              ...update.metadata,
            },
          },
        });
      });

      // Update invoice paid amount if payment is completed
      if (update.status === PaymentStatus.PAID || update.status === PaymentStatus.COMPLETED) {
        await this.updateInvoicePaidAmount(payment.invoice_id);

        // Send payment success notification
        await this.sendPaymentSuccessNotification(payment, payment.tenant_id);
      } else if (update.status === PaymentStatus.FAILED || update.status === PaymentStatus.EXPIRED) {
        // Send payment failure notification
        await this.sendPaymentFailureNotification(payment, payment.tenant_id, update.failureReason);
      }

      this.logger.log(`Successfully updated payment status: ${payment.id} -> ${update.status}`);
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error.message}`);
      throw error;
    }
  }

  async getPaymentLink(paymentId: string, tenantId: string): Promise<PaymentLinkResponse | null> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!payment) {
      return null;
    }

    return {
      id: payment.id,
      provider: payment.provider,
      providerPaymentId: payment.provider_reference,
      paymentUrl: payment.metadata?.payment_url,
      status: payment.status,
      amount: payment.amount,
      expiresAt: payment.metadata?.expires_at ? new Date(payment.metadata.expires_at) : undefined,
      metadata: payment.metadata?.provider_data,
    };
  }

  async cancelPaymentLink(paymentId: string, tenantId: string): Promise<void> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: {
          id: paymentId,
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      if (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.COMPLETED) {
        throw new HttpException('Cannot cancel completed payment', HttpStatus.BAD_REQUEST);
      }

      // Cancel payment with provider
      if (payment.provider === 'XENDIT') {
        await this.xenditService.expireInvoice(payment.provider_reference);
      } else if (payment.provider === 'MIDTRANS') {
        await this.midtransService.cancelTransaction(payment.provider_reference);
      }

      // Update payment status
      await this.prisma.withTenant(tenantId, async () => {
        return this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.CANCELLED,
            metadata: {
              ...payment.metadata,
              cancelled_at: new Date(),
            },
          },
        });
      });

      this.logger.log(`Successfully cancelled payment link: ${paymentId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel payment link: ${error.message}`);
      throw error;
    }
  }

  async retryPayment(paymentId: string, tenantId: string): Promise<PaymentLinkResponse> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: {
          id: paymentId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: {
          invoice: {
            include: {
              customer: true,
              booking: {
                include: {
                  package: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }

      if (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.COMPLETED) {
        throw new HttpException('Cannot retry completed payment', HttpStatus.BAD_REQUEST);
      }

      if (payment.status === PaymentStatus.PENDING) {
        throw new HttpException('Payment is already pending', HttpStatus.BAD_REQUEST);
      }

      // Create new payment link with same details
      const request: CreatePaymentLinkRequest = {
        invoiceId: payment.invoice_id,
        amount: payment.amount,
        description: payment.description,
        customerName: payment.invoice.customer.name,
        customerEmail: payment.invoice.customer.email,
        customerPhone: payment.invoice.customer.phone,
        preferredProvider: payment.provider as 'XENDIT' | 'MIDTRANS',
      };

      const newPaymentLink = await this.createPaymentLink(request, tenantId, payment.created_by);

      this.logger.log(`Successfully retried payment: ${paymentId} -> ${newPaymentLink.id}`);

      return newPaymentLink;
    } catch (error) {
      this.logger.error(`Failed to retry payment: ${error.message}`);
      throw error;
    }
  }

  private async createXenditPaymentLink(data: {
    externalId: string;
    amount: number;
    description: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    items?: any[];
    successUrl: string;
    failureUrl: string;
    expiryHours?: number;
    invoice: any;
  }): Promise<PaymentLinkResponse> {
    const invoiceRequest = this.xenditService.createInvoiceRequest({
      externalId: data.externalId,
      amount: data.amount,
      description: data.description,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items: data.items,
      successUrl: data.successUrl,
      failureUrl: data.failureUrl,
      expiryHours: data.expiryHours || 24,
    });

    const response: XenditInvoiceResponse = await this.xenditService.createInvoice(invoiceRequest);

    return {
      id: '', // Will be set by caller
      provider: 'XENDIT',
      providerPaymentId: response.id,
      paymentUrl: response.invoice_url,
      status: this.mapXenditStatus(response.status),
      amount: response.amount,
      expiresAt: new Date(response.expiry_date),
      metadata: response,
    };
  }

  private async createMidtransPaymentLink(data: {
    externalId: string;
    amount: number;
    description: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    items?: any[];
    successUrl: string;
    failureUrl: string;
    expiryHours?: number;
    invoice: any;
  }): Promise<PaymentLinkResponse> {
    const transactionRequest = this.midtransService.createTransactionRequest({
      orderId: data.externalId,
      amount: data.amount,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items: data.items,
      successUrl: data.successUrl,
      failureUrl: data.failureUrl,
      expiryHours: data.expiryHours || 24,
    });

    const response: MidtransTransactionResponse = await this.midtransService.createTransaction(transactionRequest);

    // For Midtrans, we need to construct the payment URL from the redirect URL
    const paymentUrl = response.redirect_url || `https://app.midtrans.com/snap/v3/vtweb/${response.token}`;

    return {
      id: '', // Will be set by caller
      provider: 'MIDTRANS',
      providerPaymentId: response.transaction_id,
      paymentUrl,
      status: this.mapMidtransStatus(response.transaction_status),
      amount: parseInt(response.gross_amount),
      expiresAt: data.expiryHours ? new Date(Date.now() + data.expiryHours * 3600 * 1000) : undefined,
      metadata: response,
    };
  }

  private mapPaymentMethod(providerMethod?: string): PaymentMethod {
    if (!providerMethod) return PaymentMethod.BANK_TRANSFER;

    const methodMap: Record<string, PaymentMethod> = {
      'VIRTUAL_ACCOUNT': PaymentMethod.VIRTUAL_ACCOUNT,
      'BANK_TRANSFER': PaymentMethod.BANK_TRANSFER,
      'EWALLET': PaymentMethod.E_WALLET,
      'CREDIT_CARD': PaymentMethod.CREDIT_CARD,
      'RETAIL_OUTLET': PaymentMethod.CASH,
      'QR_CODE': PaymentMethod.E_WALLET,
    };

    return methodMap[providerMethod.toUpperCase()] || PaymentMethod.BANK_TRANSFER;
  }

  private mapXenditStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'PENDING': PaymentStatus.PENDING,
      'PAID': PaymentStatus.PAID,
      'EXPIRED': PaymentStatus.EXPIRED,
      'FAILED': PaymentStatus.FAILED,
      'CANCELLED': PaymentStatus.CANCELLED,
    };

    return statusMap[status.toUpperCase()] || PaymentStatus.PENDING;
  }

  private mapMidtransStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'PENDING': PaymentStatus.PENDING,
      'SETTLEMENT': PaymentStatus.PAID,
      'CAPTURE': PaymentStatus.PAID,
      'EXPIRE': PaymentStatus.EXPIRED,
      'CANCEL': PaymentStatus.CANCELLED,
      'DENY': PaymentStatus.FAILED,
      'FAILURE': PaymentStatus.FAILED,
    };

    return statusMap[status.toUpperCase()] || PaymentStatus.PENDING;
  }

  private generateExternalId(invoiceNumber: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `${invoiceNumber}-${timestamp}-${random}`;
  }

  private async updateInvoicePaidAmount(invoiceId: string): Promise<void> {
    const payments = await this.prisma.payment.findMany({
      where: {
        invoice_id: invoiceId,
        status: {
          in: [PaymentStatus.PAID, PaymentStatus.COMPLETED],
        },
        deleted_at: null,
      },
    });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paid_amount: totalPaid },
    });
  }

  private async sendPaymentLinkNotification(invoice: any, paymentResponse: PaymentLinkResponse, tenantId: string): Promise<void> {
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null,
      type: 'PAYMENT_LINK_CREATED',
      channel: 'EMAIL',
      title: 'Payment Link Generated',
      content: `Payment link generated for invoice ${invoice.invoice_number}`,
      template_data: {
        invoice_number: invoice.invoice_number,
        amount: paymentResponse.amount,
        payment_url: paymentResponse.paymentUrl,
        customer_name: invoice.customer.name,
        due_date: invoice.due_date,
        provider: paymentResponse.provider,
        expires_at: paymentResponse.expiresAt,
      },
    });
  }

  private async sendPaymentSuccessNotification(payment: any, tenantId: string): Promise<void> {
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null,
      type: 'PAYMENT_RECEIVED',
      channel: 'WHATSAPP',
      title: 'Payment Received',
      content: `Payment received for invoice ${payment.invoice.invoice_number}`,
      template_data: {
        invoice_number: payment.invoice.invoice_number,
        amount: payment.amount,
        customer_name: payment.customer.name,
        paid_at: payment.paid_at,
      },
    });
  }

  private async sendPaymentFailureNotification(payment: any, tenantId: string, reason?: string): Promise<void> {
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null,
      type: 'PAYMENT_FAILED',
      channel: 'EMAIL',
      title: 'Payment Failed',
      content: `Payment failed for invoice ${payment.invoice.invoice_number}`,
      template_data: {
        invoice_number: payment.invoice.invoice_number,
        amount: payment.amount,
        customer_name: payment.customer.name,
        failure_reason: reason || 'Unknown error',
      },
    });
  }
}