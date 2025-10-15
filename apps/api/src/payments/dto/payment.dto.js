"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookDto = exports.RefundPaymentDto = exports.PaymentQueryDto = exports.UpdatePaymentDto = exports.CreatePaymentDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreatePaymentDto {
    constructor() {
        this.currency = 'IDR';
        this.exchange_rate = 1;
    }
}
exports.CreatePaymentDto = CreatePaymentDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID (optional)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice ID (optional)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "invoice_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    tslib_1.__metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment provider' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentProvider),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External transaction ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "external_transaction_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment reference number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "reference_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "payment_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    tslib_1.__metadata("design:type", String)
], CreatePaymentDto.prototype, "currency", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Exchange rate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreatePaymentDto.prototype, "exchange_rate", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata' }),
    tslib_1.__metadata("design:type", Object)
], CreatePaymentDto.prototype, "metadata", void 0);
class UpdatePaymentDto {
}
exports.UpdatePaymentDto = UpdatePaymentDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment status' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment method' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "method", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment provider' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentProvider),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External transaction ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "external_transaction_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment reference number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "reference_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "payment_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    tslib_1.__metadata("design:type", String)
], UpdatePaymentDto.prototype, "currency", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Exchange rate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdatePaymentDto.prototype, "exchange_rate", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata' }),
    tslib_1.__metadata("design:type", Object)
], UpdatePaymentDto.prototype, "metadata", void 0);
class PaymentQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.PaymentQueryDto = PaymentQueryDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], PaymentQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', default: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], PaymentQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by reference number, transaction ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by status' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by method' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "method", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by provider' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentProvider),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by customer ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by booking ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by invoice ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "invoice_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date from' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "date_from", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date to' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "date_to", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by amount min' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], PaymentQueryDto.prototype, "amount_min", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by amount max' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], PaymentQueryDto.prototype, "amount_max", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', default: 'created_at' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', default: 'desc' }),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], PaymentQueryDto.prototype, "sortOrder", void 0);
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    tslib_1.__metadata("design:type", Number)
], RefundPaymentDto.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund reason' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], RefundPaymentDto.prototype, "reason", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Refund notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], RefundPaymentDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External refund ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], RefundPaymentDto.prototype, "external_refund_id", void 0);
class PaymentWebhookDto {
}
exports.PaymentWebhookDto = PaymentWebhookDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment provider' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentProvider),
    tslib_1.__metadata("design:type", String)
], PaymentWebhookDto.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Webhook event type' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], PaymentWebhookDto.prototype, "event_type", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], PaymentWebhookDto.prototype, "payment_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'External transaction ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], PaymentWebhookDto.prototype, "external_transaction_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    tslib_1.__metadata("design:type", String)
], PaymentWebhookDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    tslib_1.__metadata("design:type", Number)
], PaymentWebhookDto.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Raw webhook data' }),
    tslib_1.__metadata("design:type", Object)
], PaymentWebhookDto.prototype, "data", void 0);
//# sourceMappingURL=payment.dto.js.map