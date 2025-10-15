import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: any): Promise<{
        data: {
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
        };
        message: string;
    }>;
    register(registerDto: RegisterDto, req: any): Promise<{
        data: {
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
        };
        message: string;
    }>;
    requestOtp(otpRequestDto: OtpRequestDto, req: any): Promise<{
        message: string;
    }>;
    verifyOtp(otpVerifyDto: OtpVerifyDto, req: any): Promise<{
        data: {
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
        };
        message: string;
    }>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        data: {
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
        };
        message: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
        data: any;
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }, req: any): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
