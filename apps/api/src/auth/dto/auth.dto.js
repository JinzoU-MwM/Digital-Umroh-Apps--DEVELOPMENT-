"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordDto = exports.OtpVerifyDto = exports.OtpRequestDto = exports.RegisterDto = exports.LoginDto = exports.ResetPasswordSchema = exports.OtpVerifySchema = exports.OtpRequestSchema = exports.RegisterSchema = exports.LoginSchema = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(client_1.UserRole).default(client_1.UserRole.VIEWER),
});
exports.OtpRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.OtpVerifySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(8),
});
class LoginDto {
}
exports.LoginDto = LoginDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    tslib_1.__metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class OtpRequestDto {
}
exports.OtpRequestDto = OtpRequestDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], OtpRequestDto.prototype, "email", void 0);
class OtpVerifyDto {
}
exports.OtpVerifyDto = OtpVerifyDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], OtpVerifyDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], OtpVerifyDto.prototype, "code", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    tslib_1.__metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
//# sourceMappingURL=auth.dto.js.map