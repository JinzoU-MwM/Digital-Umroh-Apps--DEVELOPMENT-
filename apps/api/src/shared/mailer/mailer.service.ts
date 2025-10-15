import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, otpCode: string) {
    const subject = 'Verify Your Email - Digital Umroh';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Digital Umroh</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Digital Umroh! To complete your registration and activate your account,
            please use the verification code below:
          </p>

          <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 8px; font-weight: bold;">${otpCode}</h1>
          </div>

          <p style="color: #666; line-height: 1.6;">
            This code will expire in <strong>15 minutes</strong>. If you didn't request this verification,
            please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from Digital Umroh. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const subject = 'Reset Your Password - Digital Umroh';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Digital Umroh</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your Digital Umroh account.
            Click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>

          <p style="color: #666; line-height: 1.6;">
            This link will expire in <strong>1 hour</strong>. If you didn't request this password reset,
            please ignore this email and your password will remain unchanged.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from Digital Umroh. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string, tempPassword: string, otpCode: string) {
    const subject = 'Welcome to Digital Umroh - Account Setup';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Digital Umroh</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Digital Umroh, ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your account has been created successfully. Below are your login credentials:
          </p>

          <div style="background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Temporary Password:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
            <p style="margin: 0;"><strong>Verification Code:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${otpCode}</span></p>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Please <strong>change your password</strong> after your first login for security purposes.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/login"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
              Login Now
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from Digital Umroh. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetNotification(email: string, name: string, tempPassword: string) {
    const subject = 'Your Password Has Been Reset - Digital Umroh';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Digital Umroh</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Notification</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${name}, Your password has been reset by an administrator. Below are your new credentials:
          </p>

          <div style="background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>New Password:</strong> <span style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
          </div>

          <p style="color: #666; line-height: 1.6;">
            Please <strong>change your password</strong> after logging in for security purposes.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/login"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      display: inline-block;
                      font-weight: bold;">
              Login Now
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from Digital Umroh. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Password reset notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset notification to ${email}:`, error);
      throw error;
    }
  }

  async sendBookingConfirmation(email: string, bookingDetails: any) {
    const subject = 'Booking Confirmation - Digital Umroh';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Digital Umroh</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Booking Confirmed!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing Digital Umroh for your spiritual journey. Your booking has been confirmed.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking Code:</strong> ${bookingDetails.bookingCode}</p>
            <p><strong>Package:</strong> ${bookingDetails.packageName}</p>
            <p><strong>Departure Date:</strong> ${bookingDetails.departureDate}</p>
            <p><strong>Number of Pilgrims:</strong> ${bookingDetails.numberOfPilgrims}</p>
            <p><strong>Total Amount:</strong> ${bookingDetails.totalPrice}</p>
          </div>

          <p style="color: #666; line-height: 1.6;">
            You will receive further updates about your booking via email and WhatsApp.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            This is an automated message from Digital Umroh. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
        to: email,
        subject,
        html,
      });

      this.logger.log(`Booking confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send booking confirmation email to ${email}:`, error);
      throw error;
    }
  }
}