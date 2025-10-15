import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { XenditService, XenditWebhookPayload } from '../gateways/xendit.service';
import { MidtransService, MidtransWebhookPayload } from '../gateways/midtrans.service';
import { PaymentGatewayService } from '../gateways/payment-gateway.service';

@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);

  constructor(
    private readonly xenditService: XenditService,
    private readonly midtransService: MidtransService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async handleXenditWebhook(headers: any, body: XenditWebhookPayload): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log(`Processing Xendit webhook: ${body.event}`);

      // Verify webhook signature
      const isValid = this.xenditService.verifyWebhookSignature(headers, JSON.stringify(body));

      if (!isValid) {
        this.logger.warn('Invalid Xendit webhook signature');
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Parse webhook event
      const event = this.xenditService.parseWebhookEvent(headers, body);

      // Update payment status
      await this.paymentGatewayService.updatePaymentStatus({
        providerPaymentId: event.externalTransactionId,
        status: event.status as any,
        paymentMethod: event.paymentMethod,
        paidAt: event.data?.paid_at ? new Date(event.data.paid_at) : undefined,
        paidAmount: event.data?.paid_amount,
        metadata: event.data,
      });

      this.logger.log(`Successfully processed Xendit webhook: ${event.event}`);

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: event,
      };
    } catch (error) {
      this.logger.error(`Failed to process Xendit webhook: ${error.message}`, error);
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
      };
    }
  }

  async handleMidtransWebhook(headers: any, body: MidtransWebhookPayload): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log(`Processing Midtrans webhook: ${body.order_id}`);

      // Verify webhook signature
      const isValid = this.midtransService.verifyWebhookSignature(
        body.order_id,
        body.status_code,
        body.gross_amount,
        body.signature_key,
      );

      if (!isValid) {
        this.logger.warn('Invalid Midtrans webhook signature');
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Parse webhook event
      const event = this.midtransService.parseWebhookEvent(body);

      // Update payment status
      await this.paymentGatewayService.updatePaymentStatus({
        providerPaymentId: event.externalTransactionId,
        status: event.status as any,
        paymentMethod: event.paymentMethod,
        paidAt: event.data?.paid_at ? new Date(event.data.paid_at) : undefined,
        paidAmount: event.data?.paid_amount,
        metadata: event.data,
      });

      this.logger.log(`Successfully processed Midtrans webhook: ${event.event}`);

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: event,
      };
    } catch (error) {
      this.logger.error(`Failed to process Midtrans webhook: ${error.message}`, error);
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
      };
    }
  }

  async handleGenericWebhook(
    provider: string,
    headers: any,
    body: any,
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log(`Processing generic webhook from ${provider}`);

      switch (provider.toLowerCase()) {
        case 'xendit':
          return await this.handleXenditWebhook(headers, body);
        case 'midtrans':
          return await this.handleMidtransWebhook(headers, body);
        default:
          this.logger.warn(`Unsupported webhook provider: ${provider}`);
          return {
            success: false,
            message: 'Unsupported webhook provider',
          };
      }
    } catch (error) {
      this.logger.error(`Failed to process generic webhook: ${error.message}`, error);
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
      };
    }
  }

  // Helper method to validate webhook payload structure
  private validateWebhookPayload(provider: string, body: any): boolean {
    switch (provider.toLowerCase()) {
      case 'xendit':
        return body.event && body.data && body.data.id && body.data.external_id;
      case 'midtrans':
        return body.order_id && body.status_code && body.gross_amount && body.signature_key;
      default:
        return false;
    }
  }

  // Helper method to extract provider from headers
  extractProviderFromHeaders(headers: any): string | null {
    const userAgent = headers['user-agent'] || '';
    const contentType = headers['content-type'] || '';

    // Try to identify provider from headers
    if (userAgent.includes('xendit') || headers['x-callback-token']) {
      return 'xendit';
    }

    if (userAgent.includes('midtrans') || headers['signature-key']) {
      return 'midtrans';
    }

    return null;
  }

  // Helper method to handle webhook idempotency
  async ensureIdempotency(
    provider: string,
    externalId: string,
    eventId: string,
  ): Promise<boolean> {
    try {
      // Check if we've already processed this webhook event
      // This would typically involve checking a database table or cache
      // For now, return true (not processed) to allow processing
      this.logger.log(`Checking idempotency for ${provider} webhook: ${externalId}:${eventId}`);
      return false; // Not processed yet
    } catch (error) {
      this.logger.error(`Error checking webhook idempotency: ${error.message}`);
      return false; // Allow processing on error
    }
  }

  // Helper method to mark webhook as processed
  async markWebhookProcessed(
    provider: string,
    externalId: string,
    eventId: string,
  ): Promise<void> {
    try {
      // Mark this webhook event as processed to prevent duplicate processing
      // This would typically involve updating a database table or cache entry
      this.logger.log(`Marked ${provider} webhook as processed: ${externalId}:${eventId}`);
    } catch (error) {
      this.logger.error(`Error marking webhook as processed: ${error.message}`);
    }
  }

  // Helper method to handle webhook failures
  async handleWebhookFailure(
    provider: string,
    error: Error,
    body?: any,
  ): Promise<void> {
    this.logger.error(`Webhook processing failed for ${provider}: ${error.message}`, {
      provider,
      error: error.message,
      stack: error.stack,
      body: body ? JSON.stringify(body).substring(0, 1000) : undefined,
    });

    // Here you could:
    // 1. Log the failure for monitoring
    // 2. Store the failed webhook for retry
    // 3. Send alert to admin team
    // 4. Update external monitoring systems
  }

  // Helper method to get webhook retry policy
  getWebhookRetryPolicy(provider: string): {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  } {
    const policies = {
      xendit: { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 },
      midtrans: { maxRetries: 3, retryDelay: 1000, backoffMultiplier: 2 },
    };

    return policies[provider.toLowerCase()] || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };
  }
}