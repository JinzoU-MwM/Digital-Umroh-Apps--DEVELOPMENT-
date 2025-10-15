import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XenditProvider, XenditPaymentRequest, XenditPaymentResponse } from '../providers/xendit.provider';
import { MidtransProvider, MidtransPaymentRequest, MidtransPaymentResponse } from '../providers/midtrans.provider';
import { PaymentProvider, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface PaymentGatewayRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  provider: PaymentProvider;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  externalId?: string;
  callbackUrl?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface PaymentGatewayResponse {
  paymentUrl?: string;
  token?: string;
  redirectUrl?: string;
  externalId: string;
  status: string;
  provider: PaymentProvider;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly xenditProvider: XenditProvider,
    private readonly midtransProvider: MidtransProvider,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    this.logger.log(`Creating payment with ${request.provider} for amount ${request.amount}`);

    try {
      switch (request.provider) {
        case PaymentProvider.XENDIT:
          return await this.createXenditPayment(request);
        case PaymentProvider.MIDTRANS:
          return await this.createMidtransPayment(request);
        default:
          throw new BadRequestException(`Unsupported payment provider: ${request.provider}`);
      }
    } catch (error) {
      this.logger.error(`Payment creation failed with ${request.provider}:`, error);
      throw error;
    }
  }

  private async createXenditPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    if (!this.xenditProvider.isConfigured()) {
      throw new BadRequestException('Xendit is not configured');
    }

    const xenditRequest: XenditPaymentRequest = {
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      description: request.description,
      externalId: request.externalId,
      callbackUrl: request.callbackUrl,
      successRedirectUrl: request.successRedirectUrl,
      failureRedirectUrl: request.failureRedirectUrl,
    };

    const response = await this.xenditProvider.createPayment(xenditRequest);

    return {
      paymentUrl: response.paymentUrl,
      externalId: response.externalId,
      status: response.status,
      provider: PaymentProvider.XENDIT,
    };
  }

  private async createMidtransPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    if (!this.midtransProvider.isConfigured()) {
      throw new BadRequestException('Midtrans is not configured');
    }

    const midtransRequest: MidtransPaymentRequest = {
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      description: request.description,
      externalId: request.externalId,
      callbackUrl: request.callbackUrl,
      successRedirectUrl: request.successRedirectUrl,
      failureRedirectUrl: request.failureRedirectUrl,
    };

    const response = await this.midtransProvider.createPayment(midtransRequest);

    return {
      paymentUrl: response.paymentUrl,
      token: response.token,
      redirectUrl: response.redirectUrl,
      externalId: response.externalId,
      status: response.status,
      provider: PaymentProvider.MIDTRANS,
    };
  }

  async getPaymentStatus(externalId: string, provider: PaymentProvider): Promise<any> {
    try {
      switch (provider) {
        case PaymentProvider.XENDIT:
          return await this.xenditProvider.getPaymentStatus(externalId);
        case PaymentProvider.MIDTRANS:
          return await this.midtransProvider.getPaymentStatus(externalId);
        default:
          throw new BadRequestException(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get payment status for ${externalId} with ${provider}:`, error);
      throw error;
    }
  }

  async cancelPayment(externalId: string, provider: PaymentProvider): Promise<any> {
    try {
      switch (provider) {
        case PaymentProvider.XENDIT:
          // Xendit doesn't have direct cancel, handle via status update
          throw new BadRequestException('Cancellation not supported for Xendit');
        case PaymentProvider.MIDTRANS:
          return await this.midtransProvider.cancelPayment(externalId);
        default:
          throw new BadRequestException(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to cancel payment ${externalId} with ${provider}:`, error);
      throw error;
    }
  }

  async refundPayment(externalId: string, provider: PaymentProvider, amount?: number, reason?: string): Promise<any> {
    try {
      switch (provider) {
        case PaymentProvider.XENDIT:
          // Xendit refund handling would need to be implemented
          throw new BadRequestException('Refund not supported for Xendit');
        case PaymentProvider.MIDTRANS:
          return await this.midtransProvider.refundPayment(externalId, amount, reason);
        default:
          throw new BadRequestException(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Failed to refund payment ${externalId} with ${provider}:`, error);
      throw error;
    }
  }

  async validateWebhook(provider: PaymentProvider, payload: any, signature: string): Promise<boolean> {
    try {
      switch (provider) {
        case PaymentProvider.XENDIT:
          return await this.xenditProvider.validateWebhook(payload, signature);
        case PaymentProvider.MIDTRANS:
          return await this.midtransProvider.validateWebhook(payload, signature);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`Webhook validation failed for ${provider}:`, error);
      return false;
    }
  }

  async processWebhook(provider: PaymentProvider, payload: any): Promise<any> {
    try {
      this.logger.log(`Processing webhook for ${provider}`);

      switch (provider) {
        case PaymentProvider.XENDIT:
          return await this.processXenditWebhook(payload);
        case PaymentProvider.MIDTRANS:
          return await this.midtransProvider.processNotification(payload);
        default:
          throw new BadRequestException(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Webhook processing failed for ${provider}:`, error);
      throw error;
    }
  }

  private async processXenditWebhook(payload: any): Promise<any> {
    // Process Xendit webhook payload
    const externalId = payload.external_id || payload.id;
    const status = this.mapXenditWebhookStatus(payload.status);

    return {
      externalId,
      status,
      amount: payload.amount,
      paidAmount: payload.paid_amount,
      paymentDate: payload.paid_at ? new Date(payload.paid_at) : null,
      paymentMethod: payload.payment_method,
      rawWebhook: payload,
    };
  }

  async getAvailablePaymentMethods(): Promise<any[]> {
    const allMethods = [
      {
        provider: PaymentProvider.XENDIT,
        methods: this.getXenditPaymentMethods(),
        configured: this.xenditProvider.isConfigured(),
      },
      {
        provider: PaymentProvider.MIDTRANS,
        methods: await this.midtransProvider.getPaymentMethods(),
        configured: this.midtransProvider.isConfigured(),
      },
    ];

    return allMethods.filter(provider => provider.configured);
  }

  private getXenditPaymentMethods(): any[] {
    return [
      {
        code: 'CREDIT_CARD',
        name: 'Credit Card',
        description: 'Visa, Mastercard, JCB',
        category: 'CARD',
      },
      {
        code: 'VIRTUAL_ACCOUNT',
        name: 'Virtual Account',
        description: 'BCA, BNI, BRI, Mandiri',
        category: 'BANK_TRANSFER',
      },
      {
        code: 'EWALLET',
        name: 'E-Wallet',
        description: 'GoPay, OVO, DANA, LinkAja, ShopeePay',
        category: 'EWALLET',
      },
      {
        code: 'QRIS',
        name: 'QRIS',
        description: 'QR Code payment',
        category: 'QR',
      },
    ];
  }

  private mapXenditWebhookStatus(status: string): PaymentStatus {
    const statusMap = {
      'PENDING': PaymentStatus.PENDING,
      'PAID': PaymentStatus.COMPLETED,
      'SETTLED': PaymentStatus.COMPLETED,
      'EXPIRED': PaymentStatus.EXPIRED,
      'FAILED': PaymentStatus.FAILED,
      'CANCELLED': PaymentStatus.CANCELLED,
    };

    return statusMap[status] || PaymentStatus.PENDING;
  }

  async syncPaymentStatus(paymentId: string): Promise<void> {
    // Find payment in database
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (!payment.external_transaction_id || !payment.provider) {
      throw new BadRequestException('Payment does not have external transaction ID or provider');
    }

    try {
      // Get latest status from provider
      const statusResponse = await this.getPaymentStatus(
        payment.external_transaction_id,
        payment.provider,
      );

      // Update payment in database
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: statusResponse.status,
          metadata: {
            ...payment.metadata,
            last_sync: new Date().toISOString(),
            provider_status: statusResponse,
          },
        },
      });

      // If payment is completed, update related invoice
      if (statusResponse.status === PaymentStatus.COMPLETED && payment.invoice_id) {
        await this.updateInvoicePaidAmount(payment.invoice_id);
      }

      this.logger.log(`Synced payment ${paymentId} status to ${statusResponse.status}`);
    } catch (error) {
      this.logger.error(`Failed to sync payment ${paymentId}:`, error);
      throw error;
    }
  }

  private async updateInvoicePaidAmount(invoiceId: string): Promise<void> {
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

  async getProviderConfig(provider: PaymentProvider): Promise<any> {
    switch (provider) {
      case PaymentProvider.XENDIT:
        return {
          configured: this.xenditProvider.isConfigured(),
          environment: this.configService.get<string>('XENDIT_ENVIRONMENT', 'sandbox'),
        };
      case PaymentProvider.MIDTRANS:
        return {
          configured: this.midtransProvider.isConfigured(),
          environment: this.midtransProvider.isProductionMode() ? 'production' : 'sandbox',
          clientKey: this.midtransProvider.getClientKey(),
        };
      default:
        return {
          configured: false,
          environment: 'unknown',
        };
    }
  }
}