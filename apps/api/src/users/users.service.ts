import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../shared/mailer/mailer.service';
import { UserStatus, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto, tenantId: string) {
    const { email, name, phone, role, permissions } = createUserDto;

    // Check if user already exists in tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        tenant_id: tenantId,
        email,
        deleted_at: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password
    const tempPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Generate OTP for email verification
    const otpCode = this.generateOtpCode();
    const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        phone,
        role,
        status: UserStatus.PENDING,
        permissions: permissions || [],
        email_otp_code: otpCode,
        email_otp_expires_at: otpExpiresAt,
        tenant: {
          connect: { id: tenantId }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        email_verified_at: true,
        created_at: true,
      },
    });

    // Send welcome email with temporary password and OTP
    await this.mailerService.sendWelcomeEmail(email, name, tempPassword, otpCode);

    return user;
  }

  async findAll(query: UserQueryDto, tenantId: string, currentUser: any) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deleted_at: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    // Non-admin users can only see themselves or have restricted access
    if (currentUser.role !== UserRole.OWNER && currentUser.role !== UserRole.ADMIN) {
      if (currentUser.role === UserRole.VIEWER) {
        // Viewers can see all users but no sensitive info
        // No additional filtering needed
      } else {
        // Other roles can only see themselves
        where.id = currentUser.id;
      }
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        email_verified_at: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        // Hide sensitive data from non-admin users
        ...(currentUser.role !== UserRole.OWNER && currentUser.role !== UserRole.ADMIN && {
          email: currentUser.id === currentUser.id ? true : false,
          phone: currentUser.id === currentUser.id ? true : false,
        }),
      },
    });

    return {
      users,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        email_verified_at: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        avatar_url: true,
        two_factor_enabled: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string, currentUser: any) {
    const { name, phone, role, status, permissions } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (currentUser.role !== UserRole.OWNER && currentUser.role !== UserRole.ADMIN) {
      // Users can only update their own profile (excluding role and status)
      if (currentUser.id !== id) {
        throw new ForbiddenException('You can only update your own profile');
      }
      if (role || status) {
        throw new ForbiddenException('You cannot change your role or status');
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (permissions !== undefined) updateData.permissions = permissions;

    // Only admins can change role and status
    if (currentUser.role === UserRole.OWNER || currentUser.role === UserRole.ADMIN) {
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        email_verified_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async changeStatus(id: string, status: UserStatus, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async resetPassword(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new temporary password
    const tempPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: {
        password_hash: passwordHash,
        password_changed_at: new Date(),
        // Invalidate refresh tokens
        refresh_tokens: [],
      },
    });

    // Send password reset email
    await this.mailerService.sendPasswordResetNotification(user.email, user.name, tempPassword);

    return tempPassword;
  }

  async getStats(tenantId: string) {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      usersByRole,
      recentLogins,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { deleted_at: null },
      }),
      this.prisma.user.count({
        where: { status: UserStatus.ACTIVE, deleted_at: null },
      }),
      this.prisma.user.count({
        where: { status: UserStatus.PENDING, deleted_at: null },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { deleted_at: null },
        _count: { role: true },
      }),
      this.prisma.user.count({
        where: {
          last_login_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
          deleted_at: null,
        },
      }),
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      inactive: totalUsers - activeUsers - pendingUsers,
      byRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      recentLogins,
    };
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}