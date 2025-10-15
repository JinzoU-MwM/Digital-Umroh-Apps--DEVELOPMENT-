import {
  Controller,
  Post,
  Body,
  Headers,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  Ip,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookHandlerService } from './webhook-handler.service';
import { Request } from 'express';

@ApiTags('payment-webhooks')
@Controller('payment-webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhookHandlerService: WebhookHandlerService) {}

  @Post('xendit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Xendit webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleXenditWebhook(
    @Body() body: any,
    @Headers() headers: any,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Received Xendit webhook from IP: ${ip}`);

    try {
      const result = await this.webhookHandlerService.handleXenditWebhook(headers, body);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(`Xendit webhook processing error: ${error.message}`);
      return {
        success: false,
        message: 'Webhook processing failed',
      };
    }
  }

  @Post('midtrans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Midtrans webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleMidtransWebhook(
    @Body() body: any,
    @Headers() headers: any,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Received Midtrans webhook from IP: ${ip}`);

    try {
      const result = await this.webhookHandlerService.handleMidtransWebhook(headers, body);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(`Midtrans webhook processing error: ${error.message}`);
      return {
        success: false,
        message: 'Webhook processing failed',
      };
    }
  }

  @Post('generic/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle generic payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook provider or signature' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleGenericWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers() headers: any,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Received generic webhook from ${provider} at IP: ${ip}`);

    try {
      const result = await this.webhookHandlerService.handleGenericWebhook(
        provider,
        headers,
        body,
      );

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      this.logger.error(`Generic webhook processing error for ${provider}: ${error.message}`);
      return {
        success: false,
        message: 'Webhook processing failed',
      };
    }
  }

  @Post('universal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle universal webhook with auto-detection' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Unable to detect webhook provider' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleUniversalWebhook(
    @Body() body: any,
    @Headers() headers: any,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Received universal webhook from IP: ${ip}`);

    try {
      // Try to detect provider from headers
      const provider = this.webhookHandlerService.extractProviderFromHeaders(headers);

      if (!provider) {
        this.logger.warn('Unable to detect webhook provider from universal endpoint');
        return {
          success: false,
          message: 'Unable to detect webhook provider',
        };
      }

      this.logger.log(`Detected provider: ${provider}`);

      const result = await this.webhookHandlerService.handleGenericWebhook(
        provider,
        headers,
        body,
      );

      return {
        success: result.success,
        message: result.message,
        provider,
        data: result.data,
      };
    } catch (error) {
      this.logger.error(`Universal webhook processing error: ${error.message}`);
      return {
        success: false,
        message: 'Webhook processing failed',
      };
    }
  }

  // Health check endpoint for webhooks
  @Post('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook health check endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'payment-webhooks',
    };
  }
}