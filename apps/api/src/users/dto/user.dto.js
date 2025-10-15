"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserQueryDto = exports.UpdateUserDto = exports.CreateUserDto = exports.UserQuerySchema = exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2).max(100),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UserQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    sortBy: zod_1.z.enum(['name', 'email', 'role', 'status', 'created_at']).default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], CreateUserDto.prototype, "permissions", void 0);
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], UpdateUserDto.prototype, "permissions", void 0);
class UserQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
    }
}
exports.UserQueryDto = UserQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UserQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UserQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UserQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=user.dto.js.map