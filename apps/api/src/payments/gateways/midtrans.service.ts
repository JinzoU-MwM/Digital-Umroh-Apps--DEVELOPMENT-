import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface MidtransTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  credit_card?: {
    secure?: boolean;
    channel?: string;
    bank?: string;
    installment?: {
      required?: boolean;
      terms?: {
        [bank: string]: number[];
      };
    };
    whitelist_bins?: string[];
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
    url?: string;
    image_url?: string;
  }>;
  customer_details?: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: {
      first_name: string;
      last_name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country_code?: string;
    };
    shipping_address?: {
      first_name: string;
      last_name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  enabled_payments?: string[];
  callbacks?: {
    finish?: string;
    unfinish?: string;
    error?: string;
  };
  expiry?: {
    start_time?: string;
    unit?: string;
    duration?: number;
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  custom_field4?: string;
  custom_field5?: string;
  channel?: string;
  currency?: string;
  save_token?: boolean;
  recurring?: {
    start_time?: string;
    interval?: string;
    interval_unit?: string;
    max_times?: number;
    max_amount?: number;
    retry_interval?: string;
    retry_interval_unit?: string;
    next_execution?: string;
    execution_time?: string;
    previous_execution?: string;
    execution_times?: string[];
    tokens?: string[];
  };
  point_of_contact?: string;
  user_id?: string;
  sub_merchant?: Array<{
    merchant_id: string;
    gross_amount: number;
  }>;
}

export interface MidtransTransactionResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  approval_code?: string;
  signature_key?: string;
  bank?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  permata_va_number?: string;
  bca_va_number?: string;
  bni_va_number?: string;
  bri_va_number?: string;
  cimb_va_number?: string;
  danamon_va_number?: string;
  bca_va_payments?: Array<{
    va_number: string;
    bank: string;
    transaction_time: string;
  }>;
  echannel?: {
    bill_key: string;
    biller_code: string;
  };
  cstore?: {
    store?: string;
    payment_code?: string;
    merchant_code?: string;
  };
  card_type?: string;
  mask_card?: string;
  three_ds_version?: string;
  eci?: string;
  saved_token_id?: string;
  saved_token_id_expired_at?: string;
  saved_token_status?: string;
  saved_token_masked_card?: string;
  saved_token_bank?: string;
  channel_response_code?: string;
  channel_response_message?: string;
  payment_amounts?: Array<{
    payment_id: string;
    amount: string;
    payment_type?: string;
    payment_code?: string;
    store?: string;
    transaction_time?: string;
    approval_code?: string;
  }>;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  custom_field4?: string;
  custom_field5?: string;
  currency?: string;
  fraud_recommendation?: string;
  point_of_contact?: string;
  sub_merchant?: Array<{
    merchant_id: string;
    gross_amount: string;
  }>;
  settlement_time?: string;
  merchant_id?: string;
  installment_term?: string;
  discount?: string;
  fee?: string;
  tax?: string;
  net_amount?: string;
  [key: string]: any;
}

export interface MidtransWebhookPayload {
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  payment_type: string;
  status_code: string;
  gross_amount: string;
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  transaction_time: string;
  fraud_status?: string;
  signature_key: string;
  [key: string]: any;
}

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly client: AxiosInstance;
  private readonly serverKey: string;
  private readonly clientKey: string;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
    this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
    this.isProduction = this.configService.get<string>('MIDTRANS_ENVIRONMENT') === 'production';

    const baseUrl = this.isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
  }

  async createTransaction(request: MidtransTransactionRequest): Promise<MidtransTransactionResponse> {
    try {
      this.logger.log(`Creating Midtrans transaction for order_id: ${request.transaction_details.order_id}, amount: ${request.transaction_details.gross_amount}`);

      const response = await this.client.post('/charge', request);

      this.logger.log(`Successfully created Midtrans transaction: ${response.data.transaction_id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create Midtrans transaction: ${error.message}`, error.response?.data);
      throw new HttpException(
        `Failed to create transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransaction(orderId: string): Promise<MidtransTransactionResponse> {
    try {
      const response = await this.client.get(`/${orderId}/status`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Midtrans transaction ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to get transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelTransaction(orderId: string): Promise<MidtransTransactionResponse> {
    try {
      this.logger.log(`Cancelling Midtrans transaction: ${orderId}`);

      const response = await this.client.post(`/${orderId}/cancel`);

      this.logger.log(`Successfully cancelled Midtrans transaction: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to cancel Midtrans transaction ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to cancel transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refundTransaction(orderId: string, amount?: number, reason?: string): Promise<MidtransTransactionResponse> {
    try {
      this.logger.log(`Refunding Midtrans transaction: ${orderId}, amount: ${amount || 'full'}`);

      const response = await this.client.post(`/${orderId}/refund`, {
        amount,
        reason,
      });

      this.logger.log(`Successfully refunded Midtrans transaction: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund Midtrans transaction ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to refund transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async approveTransaction(orderId: string): Promise<MidtransTransactionResponse> {
    try {
      this.logger.log(`Approving Midtrans transaction: ${orderId}`);

      const response = await this.client.post(`/${orderId}/approve`);

      this.logger.log(`Successfully approved Midtrans transaction: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to approve Midtrans transaction ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to approve transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async denyTransaction(orderId: string): Promise<MidtransTransactionResponse> {
    try {
      this.logger.log(`Denying Midtrans transaction: ${orderId}`);

      const response = await this.client.post(`/${orderId}/deny`);

      this.logger.log(`Successfully denied Midtrans transaction: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to deny Midtrans transaction ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to deny transaction: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  verifyWebhookSignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
    try {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(orderId + statusCode + grossAmount + this.serverKey)
        .digest('hex');

      const isValid = signatureKey === expectedSignature;

      if (!isValid) {
        this.logger.warn(`Invalid Midtrans webhook signature for order ${orderId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying Midtrans webhook signature: ${error.message}`);
      return false;
    }
  }

  parseWebhookEvent(body: MidtransWebhookPayload): {
    event: string;
    externalTransactionId: string;
    status: string;
    amount: number;
    paymentMethod?: string;
    data?: any;
  } {
    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const paymentType = body.payment_type;

    let status = 'PENDING';
    let event = 'payment.status';

    // Map Midtrans statuses to our internal statuses
    switch (transactionStatus) {
      case 'capture':
      case 'settlement':
        status = 'COMPLETED';
        event = 'payment.success';
        break;
      case 'pending':
        status = 'PENDING';
        event = 'payment.pending';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        status = transactionStatus.toUpperCase();
        event = 'payment.failed';
        break;
      case 'refund':
        status = 'REFUNDED';
        event = 'payment.refund';
        break;
      case 'partial_refund':
        status = 'PARTIALLY_REFUNDED';
        event = 'payment.partial_refund';
        break;
      default:
        status = transactionStatus.toUpperCase();
    }

    return {
      event,
      externalTransactionId: orderId,
      status,
      amount: parseInt(body.gross_amount),
      paymentMethod: paymentType,
      data: {
        transaction_id: body.transaction_id,
        transaction_time: body.transaction_time,
        payment_type: paymentType,
        fraud_status: body.fraud_status,
        bank: body.bank,
        va_numbers: body.va_numbers,
        echannel: body.echannel,
        cstore: body.cstore,
        card_type: body.card_type,
        mask_card: body.mask_card,
        settlement_time: body.settlement_time,
        approval_code: body.approval_code,
        // Remove sensitive data from response
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => !key.includes('signature_key') && !key.includes('server_key'))
        ),
      },
    };
  }

  generateSnapToken(request: MidtransTransactionRequest): string {
    try {
      // In production, you would call Midtrans Snap API to generate token
      // For now, return a placeholder
      this.logger.warn('Snap token generation not implemented - returning placeholder');
      return 'snap-token-placeholder';
    } catch (error) {
      this.logger.error(`Failed to generate Snap token: ${error.message}`);
      throw new HttpException(
        'Failed to generate payment token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper method to create transaction request from booking/invoice data
  createTransactionRequest(data: {
    orderId: string;
    amount: number;
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
  }): MidtransTransactionRequest {
    return {
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.amount,
      },
      item_details: data.items?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
      customer_details: {
        first_name: data.customerName.split(' ')[0],
        last_name: data.customerName.split(' ').slice(1).join(' ') || '',
        email: data.customerEmail,
        phone: data.customerPhone?.replace(/[^0-9+]/g, ''), // Clean phone number
      },
      callbacks: {
        finish: data.successUrl,
        error: data.failureUrl,
      },
      expiry: data.expiryHours ? {
        unit: 'hours',
        duration: data.expiryHours,
      } : {
        unit: 'hours',
        duration: 24, // Default 24 hours
      },
      enabled_payments: [
        'credit_card',
        'bank_transfer',
        'echannel',
        'permata_va',
        'bca_va',
        'bni_va',
        'bri_va',
        'cimb_va',
        'other_va',
        'gopay',
        'shopeepay',
        'other_qris',
        'indomaret',
        'alfamart',
      ],
      currency: 'IDR',
      channel: 'web',
    };
  }

  getClientKey(): string {
    return this.clientKey;
  }

  isProductionMode(): boolean {
    return this.isProduction;
  }

  async getBinInfo(bin: string): Promise<any> {
    try {
      const response = await this.client.get(`/bin/${bin}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get BIN info for ${bin}: ${error.message}`);
      throw new HttpException(
        `Failed to get BIN info: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPaymentsInfo(orderId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${orderId}/payments`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get payments info for ${orderId}: ${error.message}`);
      throw new HttpException(
        `Failed to get payments info: ${error.response?.data?.status_message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}