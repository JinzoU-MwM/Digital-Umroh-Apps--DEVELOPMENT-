"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, req) {
        const result = await this.authService.login(loginDto, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            tenantId: req['tenantId'],
        });
        return {
            data: result,
            message: 'Login successful',
        };
    }
    async register(registerDto, req) {
        const result = await this.authService.register(registerDto, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            tenantId: req['tenantId'],
        });
        return {
            data: result,
            message: 'Registration successful. Please verify your email.',
        };
    }
    async requestOtp(otpRequestDto, req) {
        await this.authService.requestOtp(otpRequestDto.email, {
            tenantId: req['tenantId'],
            ipAddress: req.ip,
        });
        return {
            message: 'OTP sent to your email',
        };
    }
    async verifyOtp(otpVerifyDto, req) {
        const result = await this.authService.verifyOtp(otpVerifyDto, {
            tenantId: req['tenantId'],
        });
        return {
            data: result,
            message: 'Email verified successfully',
        };
    }
    async refreshToken(body) {
        const result = await this.authService.refreshToken(body.refreshToken);
        return {
            data: result,
            message: 'Token refreshed successfully',
        };
    }
    async logout(req) {
        await this.authService.logout(req.user.id);
        return {
            message: 'Logout successful',
        };
    }
    async getProfile(req) {
        return {
            data: req.user,
            message: 'Profile retrieved successfully',
        };
    }
    async forgotPassword(body, req) {
        await this.authService.forgotPassword(body.email, {
            tenantId: req['tenantId'],
            ipAddress: req.ip,
        });
        return {
            message: 'Password reset instructions sent to your email',
        };
    }
    async resetPassword(resetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto);
        return {
            message: 'Password reset successful',
        };
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Post)('otp/request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Request OTP for email verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [auth_dto_1.OtpRequestDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "requestOtp", null);
tslib_1.__decorate([
    (0, common_1.Post)('otp/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired OTP' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [auth_dto_1.OtpVerifyDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
tslib_1.__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
tslib_1.__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 300000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
tslib_1.__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired reset token' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map