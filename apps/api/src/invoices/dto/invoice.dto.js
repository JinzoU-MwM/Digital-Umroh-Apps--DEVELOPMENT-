"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDto = exports.InvoiceQueryDto = exports.UpdateInvoiceDto = exports.CreateInvoiceDto = exports.InvoiceItemDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class InvoiceItemDto {
    constructor() {
        this.discount = 0;
        this.tax = 0;
    }
}
exports.InvoiceItemDto = InvoiceItemDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    tslib_1.__metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Item quantity' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unit price' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "unit_price", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "discount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], InvoiceItemDto.prototype, "tax", void 0);
class CreateInvoiceDto {
    constructor() {
        this.tax_rate = 0;
        this.discount_amount = 0;
        this.payment_terms = 30;
        this.late_fee_percentage = 0;
    }
}
exports.CreateInvoiceDto = CreateInvoiceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Booking ID (optional)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoice_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice issue date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "issue_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice due date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "due_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer billing address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "billing_address", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer email for invoice' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "billing_email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer phone for invoice' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], CreateInvoiceDto.prototype, "billing_phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tax rate (percentage)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "tax_rate", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discount amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "discount_amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Invoice items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment terms (days)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "payment_terms", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Late fee percentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], CreateInvoiceDto.prototype, "late_fee_percentage", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom fields' }),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], CreateInvoiceDto.prototype, "custom_fields", void 0);
class UpdateInvoiceDto {
}
exports.UpdateInvoiceDto = UpdateInvoiceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Booking ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(50),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "invoice_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice issue date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "issue_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice due date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "due_date", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice status' }),
    (0, class_validator_1.IsEnum)(client_1.InvoiceStatus),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer billing address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "billing_address", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer email for invoice' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "billing_email", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer phone for invoice' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    tslib_1.__metadata("design:type", String)
], UpdateInvoiceDto.prototype, "billing_phone", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tax rate (percentage)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "tax_rate", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Discount amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "discount_amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Invoice items' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceItemDto),
    tslib_1.__metadata("design:type", Array)
], UpdateInvoiceDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment terms (days)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "payment_terms", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Late fee percentage' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], UpdateInvoiceDto.prototype, "late_fee_percentage", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Custom fields' }),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], UpdateInvoiceDto.prototype, "custom_fields", void 0);
class InvoiceQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.InvoiceQueryDto = InvoiceQueryDto;
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], InvoiceQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', default: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], InvoiceQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by invoice number, customer name' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by status' }),
    (0, class_validator_1.IsEnum)(client_1.InvoiceStatus),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by customer ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "customer_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by booking ID' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "booking_id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date from' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "date_from", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date to' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "date_to", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by due date from' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "due_date_from", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by due date to' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "due_date_to", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by overdue status' }),
    (0, class_validator_1.IsEnum)(['overdue', 'due_soon', 'on_time']),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "overdue_status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort field', default: 'created_at' }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order', default: 'desc' }),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], InvoiceQueryDto.prototype, "sortOrder", void 0);
class PaymentDto {
}
exports.PaymentDto = PaymentDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    tslib_1.__metadata("design:type", Number)
], PaymentDto.prototype, "amount", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method' }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    tslib_1.__metadata("design:type", String)
], PaymentDto.prototype, "method", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment reference number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], PaymentDto.prototype, "reference_number", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment notes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], PaymentDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Payment date' }),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], PaymentDto.prototype, "payment_date", void 0);
//# sourceMappingURL=invoice.dto.js.map