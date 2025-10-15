import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Xendit from 'xendit-node';
import { v4 as uuidv4 } from 'uuid';
import { PaymentProvider, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface XenditPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  description: string;
  externalId?: string;
  callbackUrl?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface XenditPaymentResponse {
  paymentUrl?: string;
  token?: string;
  externalId: string;
  status: string;
}

@Injectable()
export class XenditProvider {
  private readonly xenditClient: Xendit;
  private readonly logger = new Logger(XenditProvider.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn('Xendit secret key not configured');
    }

    this.xenditClient = new Xendit({
      secretKey: secretKey || '',
    });
  }

  private getEwalletClient() {
    return this.xenditClient.EWallet;
  }

  private getInvoiceClient() {
    return this.xenditClient.Invoice;
  }

  private getVirtualAccountClient() {
    return this.xenditClient.VirtualAcc;
  }

  async createPayment(request: XenditPaymentRequest): Promise<XenditPaymentResponse> {
    const externalId = request.externalId || uuidv4();

    try {
      switch (request.paymentMethod) {
        case PaymentMethod.EWALLET:
          return await this.createEwalletPayment({ ...request, externalId });
        case PaymentMethod.VIRTUAL_ACCOUNT:
          return await this.createVirtualAccountPayment({ ...request, externalId });
        case PaymentMethod.BANK_TRANSFER:
          return await this.createBankTransferPayment({ ...request, externalId });
        case PaymentMethod.CREDIT_CARD:
          return await this.createCreditCardPayment({ ...request, externalId });
        case PaymentMethod.QRIS:
          return await this.createQRISPayment({ ...request, externalId });
        default:
          // Fall back to invoice for other methods
          return await this.createInvoicePayment({ ...request, externalId });
      }
    } catch (error) {
      this.logger.error('Xendit payment creation failed:', error);
      throw error;
    }
  }

  private async createEwalletPayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    const ewalletClient = this.getEwalletClient();

    const ewalletType = this.getEwalletType(request.paymentMethod);
    if (!ewalletType) {
      throw new Error(`Unsupported e-wallet method: ${request.paymentMethod}`);
    }

    const response = await ewalletClient.createEWalletCharge({
      referenceID: request.externalId,
      currency: 'IDR',
      amount: request.amount,
      checkoutMethod: ewalletType,
      channelProperties: {
        successRedirectURL: request.successRedirectUrl,
        failureRedirectURL: request.failureRedirectUrl,
      },
      customerDetails: {
        email: request.customerEmail,
        firstName: request.customerName.split(' ')[0],
        lastName: request.customerName.split(' ').slice(1).join(' ') || '',
      },
      basket: [
        {
          referenceID: request.externalId,
          name: request.description,
          category: 'TRAVEL',
          currency: 'IDR',
          price: request.amount,
          quantity: 1,
        },
      ],
    });

    return {
      paymentUrl: response.checkout_url,
      externalId: request.externalId,
      status: response.status,
    };
  }

  private async createVirtualAccountPayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    const vaClient = this.getVirtualAccountClient();

    const response = await vaClient.createFixedVirtualAccount({
      externalID: request.externalId,
      bankCode: this.getBankCode(request.paymentMethod),
      name: request.customerName,
      virtualAccountNumber: this.generateVANumber(),
      suggestedAmount: request.amount,
      description: request.description,
      isClosed: true,
      expectedAmt: request.amount,
    });

    return {
      externalId: request.externalId,
      status: 'PENDING',
    };
  }

  private async createBankTransferPayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    // Similar to virtual account but with different configuration
    return await this.createVirtualAccountPayment(request);
  }

  private async createCreditCardPayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    // For credit card, we use invoice method
    return await this.createInvoicePayment(request);
  }

  private async createQRISPayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    const ewalletClient = this.getEwalletClient();

    const response = await ewalletClient.createEWalletCharge({
      referenceID: request.externalId,
      currency: 'IDR',
      amount: request.amount,
      checkoutMethod: 'QRIS',
      channelProperties: {
        qrContents: `Payment for ${request.description}`,
      },
      customerDetails: {
        email: request.customerEmail,
        firstName: request.customerName.split(' ')[0],
        lastName: request.customerName.split(' ').slice(1).join(' ') || '',
      },
    });

    return {
      paymentUrl: response.qr_string,
      externalId: request.externalId,
      status: response.status,
    };
  }

  private async createInvoicePayment(request: XenditPaymentRequest & { externalId: string }): Promise<XenditPaymentResponse> {
    const invoiceClient = this.getInvoiceClient();

    const response = await invoiceClient.createInvoice({
      externalId: request.externalId,
      amount: request.amount,
      description: request.description,
      invoiceDuration: 86400, // 24 hours in seconds
      customer: {
        givenNames: request.customerName,
        email: request.customerEmail,
      },
      successRedirectURL: request.successRedirectUrl,
      failureRedirectURL: request.failureRedirectUrl,
      paymentMethods: this.getPaymentMethodsForInvoice(request.paymentMethod),
      fees: [
        {
          type: 'ADMIN',
          value: 5000, // Fixed admin fee
        },
      ],
    });

    return {
      paymentUrl: response.invoice_url,
      externalId: request.externalId,
      status: response.status,
    };
  }

  async getPaymentStatus(externalId: string): Promise<any> {
    try {
      const invoiceClient = this.getInvoiceClient();
      const invoice = await invoiceClient.getInvoice({
        invoiceID: externalId,
      });

      return {
        status: this.mapXenditStatusToPaymentStatus(invoice.status),
        amount: invoice.amount,
        paidAmount: invoice.paidAmount,
        paymentDate: invoice.paidAt ? new Date(invoice.paidAt) : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get Xendit payment status for ${externalId}:`, error);
      throw error;
    }
  }

  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    try {
      // Xendit uses callback token for webhook validation
      const expectedToken = this.configService.get<string>('XENDIT_CALLBACK_TOKEN');
      return signature === expectedToken;
    } catch (error) {
      this.logger.error('Xendit webhook validation failed:', error);
      return false;
    }
  }

  private getEwalletType(method: PaymentMethod): string | null {
    const ewalletMap = {
      [PaymentMethod.GOPAY]: 'GOPAY',
      [PaymentMethod.OVO]: 'OVO',
      [PaymentMethod.DANA]: 'DANA',
      [PaymentMethod.LINKAJA]: 'LINKAJA',
      [PaymentMethod.SHOPEEPAY]: 'SHOPEEPAY',
    };

    return ewalletMap[method] || null;
  }

  private getBankCode(method: PaymentMethod): string {
    const bankMap = {
      [PaymentMethod.VIRTUAL_ACCOUNT]: 'BCA', // Default to BCA
      [PaymentMethod.BANK_TRANSFER]: 'BCA',
    };

    return bankMap[method] || 'BCA';
  }

  private getPaymentMethodsForInvoice(method: PaymentMethod): string[] {
    const methodMap = {
      [PaymentMethod.CREDIT_CARD]: ['CREDIT_CARD'],
      [PaymentMethod.BANK_TRANSFER]: ['VIRTUAL_ACCOUNT', 'BANK_TRANSFER'],
      [PaymentMethod.EWALLET]: ['EWALLET'],
      [PaymentMethod.QRIS]: ['QRIS'],
    };

    return methodMap[method] || ['VIRTUAL_ACCOUNT', 'EWALLET', 'QRIS'];
  }

  private mapXenditStatusToPaymentStatus(xenditStatus: string): PaymentStatus {
    const statusMap = {
      'PENDING': PaymentStatus.PENDING,
      'PAID': PaymentStatus.COMPLETED,
      'SETTLED': PaymentStatus.COMPLETED,
      'EXPIRED': PaymentStatus.EXPIRED,
      'FAILED': PaymentStatus.FAILED,
      'CANCELLED': PaymentStatus.CANCELLED,
    };

    return statusMap[xenditStatus] || PaymentStatus.PENDING;
  }

  private generateVANumber(): string {
    // Generate a virtual account number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `88${timestamp}${random}`.slice(0, 16);
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('XENDIT_SECRET_KEY');
  }
}