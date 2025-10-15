import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface XenditInvoiceRequest {
  external_id: string;
  amount: number;
  description: string;
  invoice_duration?: number;
  customer: {
    given_names: string;
    email?: string;
    mobile_number?: string;
    customer_id?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    category?: string;
    url?: string;
  }>;
  fees?: Array<{
    type: string;
    value: number;
  }>;
  should_send_email?: boolean;
  should_send_sms?: boolean;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  payment_methods?: Array<string>;
  currency?: string;
  fixed_va?: boolean;
  callback_virtual_account_id?: string;
  for_user_id?: string;
  locale?: string;
  expired_time?: string;
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  is_high: boolean;
  payment_method: string;
  status: string;
  merchant_name: string;
  amount: number;
  invoice_url: string;
  expiry_date: string;
  created: string;
  updated: string;
  payer_email?: string;
  description?: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  should_send_email: boolean;
  should_send_sms: boolean;
  customer: {
    given_names: string;
    email?: string;
    mobile_number?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    category?: string;
    url?: string;
  }>;
  fees: Array<{
    type: string;
    value: number;
  }>;
  currency: string;
  paid_at?: string;
  paid_amount?: number;
  adjusted_received_amount?: number;
  payment_method_details?: any;
  payment_channel?: string;
  payment_destination?: string;
  fraud_detection?: any;
  metadata?: any;
  recurring_payment?: string;
  credit_card_charge_id?: string;
  refund_id?: string;
  reimbursement_id?: string;
}

export interface XenditPayoutRequest {
  external_id: string;
  amount: number;
  email?: string;
  mobile_number?: string;
  account_number?: string;
  account_holder_name?: string;
  bank_code?: string;
  description?: string;
  receipt_notification?: string;
}

export interface XenditWebhookPayload {
  event: string;
  business_id: string;
  created: string;
  data: {
    id: string;
    status: string;
    external_id: string;
    amount: number;
    description: string;
    payment_method: string;
    paid_at?: string;
    created: string;
    updated: string;
    merchant_name: string;
    currency: string;
    payer_email?: string;
    customer: {
      given_names: string;
      email?: string;
      mobile_number?: string;
    };
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    fees?: Array<{
      type: string;
      value: number;
    }>;
    paid_amount?: number;
    payment_channel?: string;
    payment_destination?: string;
    fraud_detection?: any;
    metadata?: any;
    [key: string]: any;
  };
}

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);
  private readonly client: AxiosInstance;
  private readonly secretKey: string;
  private readonly webhookToken: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('XENDIT_SECRET_KEY') || '';
    this.webhookToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN') || '';

    const apiKey = Buffer.from(`${this.secretKey}:`).toString('base64');

    this.client = axios.create({
      baseURL: 'https://api.xendit.co',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async createInvoice(request: XenditInvoiceRequest): Promise<XenditInvoiceResponse> {
    try {
      this.logger.log(`Creating Xendit invoice for external_id: ${request.external_id}, amount: ${request.amount}`);

      const response = await this.client.post('/v2/invoices', {
        ...request,
        currency: request.currency || 'IDR',
        invoice_duration: request.invoice_duration || 86400, // 24 hours default
        should_send_email: request.should_send_email ?? true,
        should_send_sms: request.should_send_sms ?? false,
      });

      this.logger.log(`Successfully created Xendit invoice: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create Xendit invoice: ${error.message}`, error.response?.data);
      throw new HttpException(
        `Failed to create Xendit invoice: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    try {
      const response = await this.client.get(`/v2/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Xendit invoice ${invoiceId}: ${error.message}`);
      throw new HttpException(
        `Failed to get invoice: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getInvoices(filter?: {
    external_id?: string;
    status?: string;
    created_after?: string;
    created_before?: string;
    limit?: number;
    after_id?: string;
    before_id?: string;
  }): Promise<XenditInvoiceResponse[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.external_id) params.append('external_id', filter.external_id);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.created_after) params.append('created_after', filter.created_after);
      if (filter?.created_before) params.append('created_before', filter.created_before);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.after_id) params.append('after_id', filter.after_id);
      if (filter?.before_id) params.append('before_id', filter.before_id);

      const response = await this.client.get(`/v2/invoices?${params.toString()}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Xendit invoices: ${error.message}`);
      throw new HttpException(
        `Failed to get invoices: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async expireInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    try {
      const response = await this.client.post(`/v2/invoices/${invoiceId}/expire!`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to expire Xendit invoice ${invoiceId}: ${error.message}`);
      throw new HttpException(
        `Failed to expire invoice: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createPayout(request: XenditPayoutRequest) {
    try {
      this.logger.log(`Creating Xendit payout for external_id: ${request.external_id}, amount: ${request.amount}`);

      const response = await this.client.post('/payouts', request);

      this.logger.log(`Successfully created Xendit payout: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create Xendit payout: ${error.message}`, error.response?.data);
      throw new HttpException(
        `Failed to create payout: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  verifyWebhookSignature(headers: any, body: string): boolean {
    try {
      const xenditCallbackToken = headers['x-callback-token'];

      if (!xenditCallbackToken) {
        this.logger.warn('Missing Xendit callback token in webhook headers');
        return false;
      }

      // For Xendit, the callback token should match our webhook token
      // In production, you might want to use webhook signature verification
      const isValid = xenditCallbackToken === this.webhookToken;

      if (!isValid) {
        this.logger.warn('Invalid Xendit webhook token');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying Xendit webhook signature: ${error.message}`);
      return false;
    }
  }

  parseWebhookEvent(headers: any, body: XenditWebhookPayload): {
    event: string;
    externalTransactionId: string;
    status: string;
    amount: number;
    paymentMethod?: string;
    data?: any;
  } {
    const eventType = body.event;
    const invoiceData = body.data;

    let status = 'PENDING';

    // Map Xendit statuses to our internal statuses
    switch (invoiceData.status) {
      case 'PAID':
        status = 'COMPLETED';
        break;
      case 'EXPIRED':
        status = 'EXPIRED';
        break;
      case 'PENDING':
        status = 'PENDING';
        break;
      case 'FAILED':
        status = 'FAILED';
        break;
      case 'CANCELLED':
        status = 'CANCELLED';
        break;
      default:
        status = invoiceData.status.toUpperCase();
    }

    return {
      event: eventType,
      externalTransactionId: invoiceData.external_id,
      status,
      amount: invoiceData.amount,
      paymentMethod: invoiceData.payment_method,
      data: {
        invoice_id: invoiceData.id,
        paid_at: invoiceData.paid_at,
        paid_amount: invoiceData.paid_amount,
        payment_channel: invoiceData.payment_channel,
        payment_destination: invoiceData.payment_destination,
        fraud_detection: invoiceData.fraud_detection,
        customer: invoiceData.customer,
        items: invoiceData.items,
        fees: invoiceData.fees,
        ...invoiceData.metadata,
      },
    };
  }

  async getBalance(): Promise<{
    balance: number;
    currency: string;
  }> {
    try {
      const response = await this.client.get('/balance');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Xendit balance: ${error.message}`);
      throw new HttpException(
        `Failed to get balance: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getTransactions(filter?: {
    type?: string;
    status?: string;
    created_after?: string;
    created_before?: string;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();

      if (filter?.type) params.append('type', filter.type);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.created_after) params.append('created_after', filter.created_after);
      if (filter?.created_before) params.append('created_before', filter.created_before);
      if (filter?.limit) params.append('limit', filter.limit.toString());

      const response = await this.client.get(`/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Xendit transactions: ${error.message}`);
      throw new HttpException(
        `Failed to get transactions: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Helper method to create payment request from booking/invoice data
  createInvoiceRequest(data: {
    externalId: string;
    amount: number;
    description: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
      category?: string;
    }>;
    successUrl?: string;
    failureUrl?: string;
    expiryHours?: number;
  }): XenditInvoiceRequest {
    return {
      external_id: data.externalId,
      amount: data.amount,
      description: data.description,
      invoice_duration: data.expiryHours ? data.expiryHours * 3600 : 86400, // Convert hours to seconds
      customer: {
        given_names: data.customerName,
        email: data.customerEmail,
        mobile_number: data.customerPhone?.replace(/[^0-9+]/g, ''), // Clean phone number
      },
      items: data.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
      })),
      success_redirect_url: data.successUrl,
      failure_redirect_url: data.failureUrl,
      should_send_email: !!data.customerEmail,
      should_send_sms: !!data.customerPhone,
      payment_methods: ['VIRTUAL_ACCOUNT', 'EWALLET', 'RETAIL_OUTLET', 'CREDIT_CARD', 'QR_CODE'],
      currency: 'IDR',
      fixed_va: true,
      locale: 'en',
    };
  }
}