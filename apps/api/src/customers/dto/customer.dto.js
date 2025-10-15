"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerQueryDto = exports.UpdateCustomerDto = exports.CreateCustomerDto = exports.AddressDto = exports.CustomerQuerySchema = exports.UpdateCustomerSchema = exports.CreateCustomerSchema = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const zod_1 = require("zod");
const AddressSchema = zod_1.z.object({
    street: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    postal_code: zod_1.z.string().optional(),
    country: zod_1.z.string().default('Indonesia'),
});
exports.CreateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string(),
    address: AddressSchema.optional(),
    id_type: zod_1.z.string().min(1),
    id_number: zod_1.z.string().min(1),
    birth_date: zod_1.z.string(),
    gender: zod_1.z.enum(['MALE', 'FEMALE']),
    nationality: zod_1.z.string().default('Indonesia'),
    company: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: AddressSchema.optional(),
    id_type: zod_1.z.string().min(1).optional(),
    id_number: zod_1.z.string().min(1).optional(),
    birth_date: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE']).optional(),
    nationality: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.CustomerQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE']).optional(),
    nationality: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    created_from: zod_1.z.string().optional(),
    created_to: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['name', 'email', 'phone', 'created_at', 'updated_at']).default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
class AddressDto {
}
exports.AddressDto = AddressDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "street", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "province", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "postal_code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", AddressDto)
], CreateCustomerDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "id_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "id_number", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDate)(),
    tslib_1.__metadata("design:type", Date)
], CreateCustomerDto.prototype, "birth_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['MALE', 'FEMALE']),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "company", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateCustomerDto.prototype, "notes", void 0);
class UpdateCustomerDto {
}
exports.UpdateCustomerDto = UpdateCustomerDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", AddressDto)
], UpdateCustomerDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "id_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "id_number", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Date)
], UpdateCustomerDto.prototype, "birth_date", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['MALE', 'FEMALE']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "company", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateCustomerDto.prototype, "notes", void 0);
class CustomerQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.CustomerQueryDto = CustomerQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], CustomerQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], CustomerQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(['MALE', 'FEMALE']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "gender", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "nationality", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "company", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Date)
], CustomerQueryDto.prototype, "created_from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Date)
], CustomerQueryDto.prototype, "created_to", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CustomerQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=customer.dto.js.map