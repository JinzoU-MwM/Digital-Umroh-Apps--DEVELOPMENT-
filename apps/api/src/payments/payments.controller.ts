import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentGatewayService } from './gateways/payment-gateway.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundPaymentDto, PaymentWebhookDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PaymentProvider } from '@prisma/client';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    const payment = await this.paymentsService.create(createPaymentDto, req.user.tenantId);
    return {
      success: true,
      data: payment,
      message: 'Payment created successfully',
    };
  }

  @Post('gateway/create')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create payment with payment gateway' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createWithGateway(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    const payment = await this.paymentsService.create(createPaymentDto, req.user.tenantId);

    // If payment has provider configured, create payment gateway transaction
    if (payment.provider && payment.provider !== 'MANUAL') {
      const gatewayResponse = await this.paymentGatewayService.createPayment({
        amount: payment.amount,
        paymentMethod: payment.method,
        provider: payment.provider,
        customerEmail: payment.customer?.email || '',
        customerName: payment.customer?.name || '',
        description: payment.description || '',
        externalId: payment.id,
        callbackUrl: `${req.protocol}://${req.get('host')}/api/v1/payments/webhook/${payment.provider.toLowerCase()}`,
        successRedirectUrl: `${req.protocol}://${req.get('host')}/payment/success`,
        failureRedirectUrl: `${req.protocol}://${req.get('host')}/payment/failed`,
      });

      // Update payment with external transaction ID
      await this.paymentsService.update(payment.id, {
        external_transaction_id: gatewayResponse.externalId,
        metadata: {
          ...payment.metadata,
          gatewayResponse,
        },
      }, req.user.tenantId, req.user);

      return {
        success: true,
        data: {
          payment,
          gateway: gatewayResponse,
        },
        message: 'Payment created with gateway successfully',
      };
    }

    return {
      success: true,
      data: payment,
      message: 'Payment created successfully',
    };
  }

  @Get('gateway/methods')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get available payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods() {
    const methods = await this.paymentGatewayService.getAvailablePaymentMethods();
    return {
      success: true,
      data: methods,
      message: 'Payment methods retrieved successfully',
    };
  }

  @Post(':id/sync')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Sync payment status with provider' })
  @ApiResponse({ status: 200, description: 'Payment status synced successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async syncPayment(@Param('id') id: string, @Request() req) {
    await this.paymentGatewayService.syncPaymentStatus(id);
    const payment = await this.paymentsService.findOne(id, req.user.tenantId);
    return {
      success: true,
      data: payment,
      message: 'Payment status synced successfully',
    };
  }

  @Get('gateway/config/:provider')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get payment provider configuration' })
  @ApiResponse({ status: 200, description: 'Provider config retrieved successfully' })
  @ApiParam({ name: 'provider', description: 'Payment provider' })
  async getProviderConfig(@Param('provider') provider: string) {
    const config = await this.paymentGatewayService.getProviderConfig(provider.toUpperCase());
    return {
      success: true,
      data: config,
      message: 'Provider config retrieved successfully',
    };
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Handle payment webhook from payment provider' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers() headers: Record<string, string>,
    @Body() webhookData: any,
    @Request() req,
  ) {
    try {
      const paymentProvider = provider.toUpperCase() as PaymentProvider;

      // Get signature from headers (different providers use different header names)
      const signature = headers['x-callback-token'] ||
                       headers['signature-key'] ||
                       headers['webhook-signature'] ||
                       headers['signature'];

      // Verify webhook signature based on provider
      const isVerified = await this.paymentGatewayService.validateWebhook(
        paymentProvider,
        webhookData,
        signature,
      );

      if (!isVerified) {
        return {
          success: false,
          message: 'Invalid webhook signature',
        };
      }

      // Process webhook
      const result = await this.paymentGatewayService.processWebhook(
        paymentProvider,
        webhookData,
      );

      // Update payment status in database
      if (result.externalId) {
        await this.paymentsService.processWebhook(
          provider,
          {
            ...webhookData,
            payment_id: result.externalId,
            external_transaction_id: result.externalId,
            status: result.status,
            amount: result.amount,
          },
          req.user?.tenantId,
        );
      }

      return {
        success: true,
        data: result,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      };
    }
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all payments with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(@Query() query: PaymentQueryDto, @Request() req) {
    const result = await this.paymentsService.findAll(query, req.user.tenantId, req.user);
    return {
      success: true,
      data: result,
      message: 'Payments retrieved successfully',
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get payments statistics overview' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Request() req) {
    const stats = await this.paymentsService.getStats(req.user.tenantId);
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.findOne(id, req.user.tenantId);
    return {
      success: true,
      data: payment,
      message: 'Payment retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ) {
    const payment = await this.paymentsService.update(id, updatePaymentDto, req.user.tenantId, req.user);
    return {
      success: true,
      data: payment,
      message: 'Payment updated successfully',
    };
  }

  @Post(':id/refund')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Payment cannot be refunded' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async refund(
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
    @Request() req,
  ) {
    const refund = await this.paymentsService.refund(id, refundDto, req.user.tenantId);
    return {
      success: true,
      data: refund,
      message: 'Refund processed successfully',
    };
  }

  @Post(':id/cancel')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Payment cannot be cancelled' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.cancel(id, req.user.tenantId);
    return {
      success: true,
      data: payment,
      message: 'Payment cancelled successfully',
    };
  }

  @Post(':id/retry')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Retry a failed payment' })
  @ApiResponse({ status: 200, description: 'Payment retry initiated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: { enum: ['FAILED', 'CANCELLED', 'EXPIRED'] }, description: 'Payment cannot be retried' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async retry(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.retry(id, req.user.tenantId);
    return {
      success: true,
      data: payment,
      message: 'Payment retry initiated',
    };
  }
}