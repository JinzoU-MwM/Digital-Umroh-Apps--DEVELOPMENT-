import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, OtpRequestDto, OtpVerifyDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
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

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
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

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  @ApiOperation({ summary: 'Request OTP for email verification' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async requestOtp(@Body() otpRequestDto: OtpRequestDto, @Req() req: any) {
    await this.authService.requestOtp(otpRequestDto.email, {
      tenantId: req['tenantId'],
      ipAddress: req.ip,
    });

    return {
      message: 'OTP sent to your email',
    };
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto, @Req() req: any) {
    const result = await this.authService.verifyOtp(otpVerifyDto, {
      tenantId: req['tenantId'],
    });

    return {
      data: result,
      message: 'Email verified successfully',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    const result = await this.authService.refreshToken(body.refreshToken);

    return {
      data: result,
      message: 'Token refreshed successfully',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);

    return {
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Req() req: any) {
    return {
      data: req.user,
      message: 'Profile retrieved successfully',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() body: { email: string }, @Req() req: any) {
    await this.authService.forgotPassword(body.email, {
      tenantId: req['tenantId'],
      ipAddress: req.ip,
    });

    return {
      message: 'Password reset instructions sent to your email',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);

    return {
      message: 'Password reset successful',
    };
  }
}