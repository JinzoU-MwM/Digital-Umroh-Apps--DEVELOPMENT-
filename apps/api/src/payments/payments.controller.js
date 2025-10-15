"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const payment_gateway_service_1 = require("./services/payment-gateway.service");
const payment_dto_1 = require("./dto/payment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, paymentGatewayService) {
        this.paymentsService = paymentsService;
        this.paymentGatewayService = paymentGatewayService;
    }
    async create(createPaymentDto, req) {
        const payment = await this.paymentsService.create(createPaymentDto, req.user.tenantId);
        return {
            success: true,
            data: payment,
            message: 'Payment created successfully',
        };
    }
    async createWithGateway(createPaymentDto, req) {
        const payment = await this.paymentsService.create(createPaymentDto, req.user.tenantId);
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
    async getPaymentMethods() {
        const methods = await this.paymentGatewayService.getAvailablePaymentMethods();
        return {
            success: true,
            data: methods,
            message: 'Payment methods retrieved successfully',
        };
    }
    async syncPayment(id, req) {
        await this.paymentGatewayService.syncPaymentStatus(id);
        const payment = await this.paymentsService.findOne(id, req.user.tenantId);
        return {
            success: true,
            data: payment,
            message: 'Payment status synced successfully',
        };
    }
    async getProviderConfig(provider) {
        const config = await this.paymentGatewayService.getProviderConfig(provider.toUpperCase());
        return {
            success: true,
            data: config,
            message: 'Provider config retrieved successfully',
        };
    }
    async handleWebhook(provider, headers, webhookData, req) {
        try {
            const paymentProvider = provider.toUpperCase();
            const signature = headers['x-callback-token'] ||
                headers['signature-key'] ||
                headers['webhook-signature'] ||
                headers['signature'];
            const isVerified = await this.paymentGatewayService.validateWebhook(paymentProvider, webhookData, signature);
            if (!isVerified) {
                return {
                    success: false,
                    message: 'Invalid webhook signature',
                };
            }
            const result = await this.paymentGatewayService.processWebhook(paymentProvider, webhookData);
            if (result.externalId) {
                await this.paymentsService.processWebhook(provider, {
                    ...webhookData,
                    payment_id: result.externalId,
                    external_transaction_id: result.externalId,
                    status: result.status,
                    amount: result.amount,
                }, req.user?.tenantId);
            }
            return {
                success: true,
                data: result,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Webhook processing failed',
                error: error.message,
            };
        }
    }
    async findAll(query, req) {
        const result = await this.paymentsService.findAll(query, req.user.tenantId, req.user);
        return {
            success: true,
            data: result,
            message: 'Payments retrieved successfully',
        };
    }
    async getStats(req) {
        const stats = await this.paymentsService.getStats(req.user.tenantId);
        return {
            success: true,
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async findOne(id, req) {
        const payment = await this.paymentsService.findOne(id, req.user.tenantId);
        return {
            success: true,
            data: payment,
            message: 'Payment retrieved successfully',
        };
    }
    async update(id, updatePaymentDto, req) {
        const payment = await this.paymentsService.update(id, updatePaymentDto, req.user.tenantId, req.user);
        return {
            success: true,
            data: payment,
            message: 'Payment updated successfully',
        };
    }
    async refund(id, refundDto, req) {
        const refund = await this.paymentsService.refund(id, refundDto, req.user.tenantId);
        return {
            success: true,
            data: refund,
            message: 'Refund processed successfully',
        };
    }
    async cancel(id, req) {
        const payment = await this.paymentsService.cancel(id, req.user.tenantId);
        return {
            success: true,
            data: payment,
            message: 'Payment cancelled successfully',
        };
    }
    async retry(id, req) {
        const payment = await this.paymentsService.retry(id, req.user.tenantId);
        return {
            success: true,
            data: payment,
            message: 'Payment retry initiated',
        };
    }
};
exports.PaymentsController = PaymentsController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new payment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [payment_dto_1.CreatePaymentDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Post)('gateway/create'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment with payment gateway' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [payment_dto_1.CreatePaymentDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "createWithGateway", null);
tslib_1.__decorate([
    (0, common_1.Get)('gateway/methods'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get available payment methods' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment methods retrieved successfully' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentMethods", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Sync payment status with provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment status synced successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "syncPayment", null);
tslib_1.__decorate([
    (0, common_1.Get)('gateway/config/:provider'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment provider configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Provider config retrieved successfully' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Payment provider' }),
    tslib_1.__param(0, (0, common_1.Param)('provider')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "getProviderConfig", null);
tslib_1.__decorate([
    (0, common_1.Post)('webhook/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle payment webhook from payment provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('provider')),
    tslib_1.__param(1, (0, common_1.Headers)()),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__param(3, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payments retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [payment_dto_1.PaymentQueryDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get payments statistics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update payment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, payment_dto_1.UpdatePaymentDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment cannot be refunded' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, payment_dto_1.RefundPaymentDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment cannot be cancelled' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancel", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Retry a failed payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment retry initiated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    (0, swagger_1.ApiResponse)({ status: { enum: ['FAILED', 'CANCELLED', 'EXPIRED'] }, description: 'Payment cannot be retried' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentsController.prototype, "retry", null);
exports.PaymentsController = PaymentsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    tslib_1.__metadata("design:paramtypes", [payments_service_1.PaymentsService,
        payment_gateway_service_1.PaymentGatewayService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map