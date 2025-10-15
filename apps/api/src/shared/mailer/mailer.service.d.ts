import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly configService;
    private readonly transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendVerificationEmail(email: string, otpCode: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
    sendWelcomeEmail(email: string, name: string, tempPassword: string, otpCode: string): Promise<void>;
    sendPasswordResetNotification(email: string, name: string, tempPassword: string): Promise<void>;
    sendBookingConfirmation(email: string, bookingDetails: any): Promise<void>;
}
