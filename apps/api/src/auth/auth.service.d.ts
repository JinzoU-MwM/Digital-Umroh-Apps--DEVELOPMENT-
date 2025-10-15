import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../shared/mailer/mailer.service';
import { LoginDto, RegisterDto, OtpVerifyDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly mailerService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, mailerService: MailerService);
    login(loginDto: LoginDto, context: {
        ipAddress: string;
        userAgent: string;
        tenantId: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: any;
        };
    }>;
    register(registerDto: RegisterDto, context: {
        ipAddress: string;
        userAgent: string;
        tenantId: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: any;
        };
        requiresEmailVerification: boolean;
    }>;
    requestOtp(email: string, context: {
        tenantId: string;
        ipAddress: string;
    }): Promise<void>;
    verifyOtp(otpVerifyDto: OtpVerifyDto, context: {
        tenantId: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
            emailVerified: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: any;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: any;
        };
    }>;
    logout(userId: string): Promise<void>;
    forgotPassword(email: string, context: {
        tenantId: string;
        ipAddress: string;
    }): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>;
    private generateTokens;
    private storeRefreshToken;
    private generateOtpCode;
}
