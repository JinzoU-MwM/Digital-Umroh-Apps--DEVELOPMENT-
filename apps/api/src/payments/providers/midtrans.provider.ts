import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Midtrans from 'midtrans-client';
import { v4 as uuidv4 } from 'uuid';
import { PaymentProvider, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface MidtransPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  externalId?: string;
  callbackUrl?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface MidtransPaymentResponse {
  paymentUrl?: string;
  token?: string;
  redirectUrl?: string;
  externalId: string;
  status: string;
}

@Injectable()
export class MidtransProvider {
  private readonly logger = new Logger(MidtransProvider.name);
  private readonly core: Midtrans.CoreApi;
  private readonly snap: Midtrans.Snap;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY');
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (!serverKey) {
      this.logger.warn('Midtrans server key not configured');
    }

    this.core = new Midtrans.CoreApi({
      isProduction: this.isProduction,
      serverKey: serverKey || '',
      clientKey: clientKey || '',
    });

    this.snap = new Midtrans.Snap({
      isProduction: this.isProduction,
      serverKey: serverKey || '',
      clientKey: clientKey || '',
    });
  }

  async createPayment(request: MidtransPaymentRequest): Promise<MidtransPaymentResponse> {
    const externalId = request.externalId || uuidv4();

    try {
      const parameter = {
        transaction_details: {
          order_id: externalId,
          gross_amount: request.amount,
        },
        customer_details: {
          first_name: request.customerName.split(' ')[0],
          last_name: request.customerName.split(' ').slice(1).join(' ') || '',
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        item_details: [
          {
            id: externalId,
            price: request.amount,
            quantity: 1,
            name: request.description,
            category: 'TRAVEL',
          },
        ],
        enabled_payments: this.getEnabledPayments(request.paymentMethod),
        callbacks: {
          finish: request.successRedirectUrl,
          unfocus: request.failureRedirectUrl,
          error: request.failureRedirectUrl,
          pending: request.callbackUrl,
        },
        expiry: {
          unit: 'hours',
          duration: 24,
        },
        custom_field1: 'DIGITAL_UMROH',
        custom_field2: request.paymentMethod,
      };

      const transaction = await this.snap.createTransaction(parameter);

      return {
        paymentUrl: transaction.redirect_url,
        token: transaction.token,
        externalId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Midtrans payment creation failed:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId: string): Promise<any> {
    try {
      const statusResponse = await this.core.transaction.status(orderId);

      return {
        status: this.mapMidtransStatusToPaymentStatus(statusResponse.transaction_status),
        amount: statusResponse.gross_amount,
        paidAmount: statusResponse.settlement_amount || statusResponse.gross_amount,
        paymentDate: statusResponse.settlement_time ? new Date(statusResponse.settlement_time) : null,
        fraudStatus: statusResponse.fraud_status,
        paymentType: statusResponse.payment_type,
      };
    } catch (error) {
      this.logger.error(`Failed to get Midtrans payment status for ${orderId}:`, error);
      throw error;
    }
  }

  async cancelPayment(orderId: string): Promise<any> {
    try {
      const response = await this.core.transaction.cancel(orderId);
      return response;
    } catch (error) {
      this.logger.error(`Failed to cancel Midtrans payment ${orderId}:`, error);
      throw error;
    }
  }

  async refundPayment(orderId: string, amount?: number, reason?: string): Promise<any> {
    try {
      const parameter: any = {
        order_id: orderId,
      };

      if (amount) {
        parameter.amount = amount;
      }

      if (reason) {
        parameter.reason = reason;
      }

      const response = await this.core.transaction.refund(parameter);
      return response;
    } catch (error) {
      this.logger.error(`Failed to refund Midtrans payment ${orderId}:`, error);
      throw error;
    }
  }

  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');

      // Midtrans SHA512 signature validation
      const expectedSignature = this.createSignature(payload.order_id, payload.status_code, payload.gross_amount, serverKey);

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error('Midtrans webhook validation failed:', error);
      return false;
    }
  }

  private createSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
    const crypto = require('crypto');
    const input = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash('sha512').update(input).digest('hex');
  }

  private getEnabledPayments(method: PaymentMethod): string[] {
    const paymentMap = {
      [PaymentMethod.CREDIT_CARD]: ['credit_card'],
      [PaymentMethod.BANK_TRANSFER]: ['bank_transfer'],
      [PaymentMethod.EWALLET]: [
        'gopay',
        'ovo',
        'dana',
        'linkaja',
        'shopeepay'
      ],
      [PaymentMethod.QRIS]: ['gopay', 'shopeepay'],
      [PaymentMethod.VIRTUAL_ACCOUNT]: [
        'echannel',
        'bca_klikbca',
        'bca_klikpay',
        'bri_epay',
        'cimb_clicks',
        'bca_va',
        'bri_va',
        'bni_va',
        'cimb_va',
        'mandiri_va',
        'permata_va'
      ],
      [PaymentMethod.CONVENIENCE_STORE]: ['indomaret', 'alfamart'],
      [PaymentMethod.CASH]: ['cstore'],
    };

    return paymentMap[method] || ['credit_card', 'bank_transfer', 'echannel'];
  }

  private mapMidtransStatusToPaymentStatus(midtransStatus: string): PaymentStatus {
    const statusMap = {
      'capture': PaymentStatus.COMPLETED,
      'settlement': PaymentStatus.COMPLETED,
      'pending': PaymentStatus.PENDING,
      'deny': PaymentStatus.FAILED,
      'cancel': PaymentStatus.CANCELLED,
      'expire': PaymentStatus.EXPIRED,
      'refund': PaymentStatus.REFUNDED,
      'partial_refund': PaymentStatus.REFUNDED,
      'authorize': PaymentStatus.PENDING,
    };

    return statusMap[midtransStatus] || PaymentStatus.PENDING;
  }

  async getPaymentMethods(): Promise<any[]> {
    // Return available payment methods from Midtrans
    return [
      {
        code: 'credit_card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, JCB, Amex',
        category: 'CARD',
      },
      {
        code: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Virtual Account via major banks',
        category: 'BANK_TRANSFER',
      },
      {
        code: 'echannel',
        name: 'Mandiri Bill',
        description: 'Mandiri online banking',
        category: 'BANK_TRANSFER',
      },
      {
        code: 'gopay',
        name: 'GoPay',
        description: 'GoPay e-wallet',
        category: 'EWALLET',
      },
      {
        code: 'ovo',
        name: 'OVO',
        description: 'OVO e-wallet',
        category: 'EWALLET',
      },
      {
        code: 'dana',
        name: 'DANA',
        description: 'DANA e-wallet',
        category: 'EWALLET',
      },
      {
        code: 'shopeepay',
        name: 'ShopeePay',
        description: 'ShopeePay e-wallet',
        category: 'EWALLET',
      },
      {
        code: 'indomaret',
        name: 'Indomaret',
        description: 'Cash payment at Indomaret stores',
        category: 'CSTORE',
      },
      {
        code: 'alfamart',
        name: 'Alfamart',
        description: 'Cash payment at Alfamart stores',
        category: 'CSTORE',
      },
    ];
  }

  async processNotification(notification: any): Promise<any> {
    try {
      const orderId = notification.order_id;
      const statusResponse = await this.getPaymentStatus(orderId);

      // Update payment status based on notification
      return {
        externalId: orderId,
        status: statusResponse.status,
        amount: statusResponse.amount,
        paidAmount: statusResponse.paidAmount,
        paymentDate: statusResponse.paymentDate,
        paymentMethod: statusResponse.paymentType,
        fraudStatus: statusResponse.fraudStatus,
        rawNotification: notification,
      };
    } catch (error) {
      this.logger.error('Failed to process Midtrans notification:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('MIDTRANS_SERVER_KEY');
  }

  getClientKey(): string {
    return this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
  }

  isProductionMode(): boolean {
    return this.isProduction;
  }
}