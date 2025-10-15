"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../database/prisma.service");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const mailer_service_1 = require("../shared/mailer/mailer.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, mailerService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailerService = mailerService;
    }
    async login(loginDto, context) {
        const { email, password } = loginDto;
        const user = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.findUnique({
                where: { tenant_id_email: { tenant_id: context.tenantId, email } },
                select: {
                    id: true,
                    email: true,
                    password_hash: true,
                    name: true,
                    role: true,
                    status: true,
                    email_verified_at: true,
                    tenant_id: true,
                },
            });
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.withTenant(context.tenantId, async () => {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { last_login_at: new Date() },
            });
        });
        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: !!user.email_verified_at,
            },
            tokens,
        };
    }
    async register(registerDto, context) {
        const { email, password, name, phone, role } = registerDto;
        const existingUser = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.findUnique({
                where: { tenant_id_email: { tenant_id: context.tenantId, email } },
            });
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const otpCode = this.generateOtpCode();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const user = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.create({
                data: {
                    tenant_id: context.tenantId,
                    email,
                    password_hash: passwordHash,
                    name,
                    phone,
                    role: role || 'VIEWER',
                    status: 'PENDING',
                    email_otp_code: otpCode,
                    email_otp_expires_at: otpExpiresAt,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    tenant_id: true,
                },
            });
        });
        await this.mailerService.sendVerificationEmail(email, otpCode);
        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                emailVerified: false,
            },
            tokens,
            requiresEmailVerification: true,
        };
    }
    async requestOtp(email, context) {
        const user = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.findUnique({
                where: { tenant_id_email: { tenant_id: context.tenantId, email } },
            });
        });
        if (!user) {
            return;
        }
        const otpCode = this.generateOtpCode();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.withTenant(context.tenantId, async () => {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email_otp_code: otpCode,
                    email_otp_expires_at: otpExpiresAt,
                },
            });
        });
        await this.mailerService.sendVerificationEmail(email, otpCode);
    }
    async verifyOtp(otpVerifyDto, context) {
        const { email, code } = otpVerifyDto;
        const user = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.findUnique({
                where: { tenant_id_email: { tenant_id: context.tenantId, email } },
            });
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.email_otp_code !== code || user.email_otp_expires_at < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        await this.prisma.withTenant(context.tenantId, async () => {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    email_verified_at: new Date(),
                    email_otp_code: null,
                    email_otp_expires_at: null,
                    status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
                },
            });
        });
        const tokens = await this.generateTokens(user);
        await this.storeRefreshToken(user.id, tokens.refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
                emailVerified: true,
            },
            tokens,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
            });
            const storedTokens = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { refresh_tokens: true },
            });
            if (!storedTokens || !storedTokens.refresh_tokens.includes(refreshToken)) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    email_verified_at: true,
                },
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    emailVerified: !!user.email_verified_at,
                },
                tokens,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refresh_tokens: [] },
        });
    }
    async forgotPassword(email, context) {
        const user = await this.prisma.withTenant(context.tenantId, async () => {
            return this.prisma.user.findUnique({
                where: { tenant_id_email: { tenant_id: context.tenantId, email } },
            });
        });
        if (!user) {
            return;
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.withTenant(context.tenantId, async () => {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    refresh_tokens: [...user.refresh_tokens, `reset:${resetToken}`],
                },
            });
        });
        await this.mailerService.sendPasswordResetEmail(email, resetToken);
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const users = await this.prisma.user.findMany({
            where: {
                refresh_tokens: {
                    has: `reset:${token}`,
                },
            },
        });
        if (users.length === 0) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const user = users[0];
        const passwordHash = await bcrypt.hash(password, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: passwordHash,
                refresh_tokens: user.refresh_tokens.filter(t => t !== `reset:${token}`),
                password_changed_at: new Date(),
            },
        });
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '24h'),
            secret: this.configService.get('JWT_SECRET'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
            secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '24h'),
        };
    }
    async storeRefreshToken(userId, refreshToken) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refresh_tokens: {
                    set: [refreshToken],
                },
            },
        });
    }
    generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mailer_service_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map