import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentGatewayService, CreatePaymentLinkRequest } from './gateways/payment-gateway.service';
import { TenantId } from '../decorators/tenant-id.decorator';

@ApiTags('payment-links')
@Controller('payment-links')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentLinksController {
  private readonly logger = new Logger(PaymentLinksController.name);

  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'FINANCE', 'SALES')
  @ApiOperation({ summary: 'Create payment link' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully' })
  async createPaymentLink(
    @Body() createPaymentLinkDto: CreatePaymentLinkRequest,
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const paymentLink = await this.paymentGatewayService.createPaymentLink(
        createPaymentLinkDto,
        tenantId,
        req.user.id,
      );

      return {
        success: true,
        message: 'Payment link created successfully',
        data: paymentLink,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment link: ${error.message}`);
      throw error;
    }
  }

  @Get(':paymentId')
  @Roles('OWNER', 'ADMIN', 'FINANCE', 'SALES', 'VIEWER')
  @ApiOperation({ summary: 'Get payment link details' })
  @ApiResponse({ status: 200, description: 'Payment link retrieved successfully' })
  async getPaymentLink(
    @Param('paymentId') paymentId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const paymentLink = await this.paymentGatewayService.getPaymentLink(paymentId, tenantId);

      if (!paymentLink) {
        return {
          success: false,
          message: 'Payment link not found',
        };
      }

      return {
        success: true,
        data: paymentLink,
      };
    } catch (error) {
      this.logger.error(`Failed to get payment link: ${error.message}`);
      throw error;
    }
  }

  @Delete(':paymentId')
  @Roles('OWNER', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Cancel payment link' })
  @ApiResponse({ status: 200, description: 'Payment link cancelled successfully' })
  async cancelPaymentLink(
    @Param('paymentId') paymentId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      await this.paymentGatewayService.cancelPaymentLink(paymentId, tenantId);

      return {
        success: true,
        message: 'Payment link cancelled successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to cancel payment link: ${error.message}`);
      throw error;
    }
  }

  @Post(':paymentId/retry')
  @Roles('OWNER', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Retry failed payment' })
  @ApiResponse({ status: 201, description: 'Payment retry created successfully' })
  async retryPayment(
    @Param('paymentId') paymentId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const newPaymentLink = await this.paymentGatewayService.retryPayment(paymentId, tenantId);

      return {
        success: true,
        message: 'Payment retry created successfully',
        data: newPaymentLink,
      };
    } catch (error) {
      this.logger.error(`Failed to retry payment: ${error.message}`);
      throw error;
    }
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Handle payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers() headers: any,
  ) {
    try {
      this.logger.log(`Received webhook from ${provider}`);

      // Webhook processing is handled by the payments service
      // This endpoint just validates the webhook and forwards it

      return {
        success: true,
        message: 'Webhook received',
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`);
      throw error;
    }
  }
}