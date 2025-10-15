import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../shared/mailer/mailer.service';
import {
  LoginDto,
  RegisterDto,
  OtpRequestDto,
  OtpVerifyDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto, context: { ipAddress: string; userAgent: string; tenantId: string }) {
    const { email, password } = loginDto;

    // Find user with tenant context
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.withTenant(context.tenantId, async () => {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token
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

  async register(registerDto: RegisterDto, context: { ipAddress: string; userAgent: string; tenantId: string }) {
    const { email, password, name, phone, role } = registerDto;

    // Check if user already exists in tenant
    const existingUser = await this.prisma.withTenant(context.tenantId, async () => {
      return this.prisma.user.findUnique({
        where: { tenant_id_email: { tenant_id: context.tenantId, email } },
      });
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate OTP for email verification
    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await this.prisma.withTenant(context.tenantId, async () => {
      return this.prisma.user.create({
        data: {
          tenant_id: context.tenantId,
          email,
          password_hash: passwordHash,
          name,
          phone,
          role: role || 'VIEWER',
          status: 'PENDING', // Will be ACTIVE after email verification
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

    // Send verification email
    await this.mailerService.sendVerificationEmail(email, otpCode);

    // Generate tokens for auto-login after verification
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

  async requestOtp(email: string, context: { tenantId: string; ipAddress: string }) {
    const user = await this.prisma.withTenant(context.tenantId, async () => {
      return this.prisma.user.findUnique({
        where: { tenant_id_email: { tenant_id: context.tenantId, email } },
      });
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate new OTP
    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new OTP
    await this.prisma.withTenant(context.tenantId, async () => {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email_otp_code: otpCode,
          email_otp_expires_at: otpExpiresAt,
        },
      });
    });

    // Send OTP email
    await this.mailerService.sendVerificationEmail(email, otpCode);
  }

  async verifyOtp(otpVerifyDto: OtpVerifyDto, context: { tenantId: string }) {
    const { email, code } = otpVerifyDto;

    const user = await this.prisma.withTenant(context.tenantId, async () => {
      return this.prisma.user.findUnique({
        where: { tenant_id_email: { tenant_id: context.tenantId, email } },
      });
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_otp_code !== code || user.email_otp_expires_at < new Date()) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Verify email and activate user if pending
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

    // Generate new tokens
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      // Check if refresh token is stored
      const storedTokens = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { refresh_tokens: true },
      });

      if (!storedTokens || !storedTokens.refresh_tokens.includes(refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
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
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
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
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_tokens: [] },
    });
  }

  async forgotPassword(email: string, context: { tenantId: string; ipAddress: string }) {
    const user = await this.prisma.withTenant(context.tenantId, async () => {
      return this.prisma.user.findUnique({
        where: { tenant_id_email: { tenant_id: context.tenantId, email } },
      });
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    await this.prisma.withTenant(context.tenantId, async () => {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          // Store reset token in refresh_tokens array or create a dedicated field
          refresh_tokens: [...user.refresh_tokens, `reset:${resetToken}`],
        },
      });
    });

    // Send reset email
    await this.mailerService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Find user by reset token (this is a simplified approach)
    // In production, you'd want a dedicated password_resets table
    const users = await this.prisma.user.findMany({
      where: {
        refresh_tokens: {
          has: `reset:${token}`,
        },
      },
    });

    if (users.length === 0) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = users[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and remove reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        refresh_tokens: user.refresh_tokens.filter(t => t !== `reset:${token}`),
        password_changed_at: new Date(),
      },
    });
  }

  private async generateTokens(user: any) {
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

  private async storeRefreshToken(userId: string, refreshToken: string) {
    // Store refresh token in user's refresh_tokens array
    // Keep only the last 5 refresh tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_tokens: {
          set: [refreshToken],
        },
      },
    });
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}