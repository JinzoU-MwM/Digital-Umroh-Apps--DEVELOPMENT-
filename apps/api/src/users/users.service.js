"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = require("bcryptjs");
const mailer_service_1 = require("../shared/mailer/mailer.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma, mailerService) {
        this.prisma = prisma;
        this.mailerService = mailerService;
    }
    async create(createUserDto, tenantId) {
        const { email, name, phone, role, permissions } = createUserDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                tenant_id: tenantId,
                email,
                deleted_at: null,
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const tempPassword = this.generateRandomPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const otpCode = this.generateOtpCode();
        const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email,
                password_hash: passwordHash,
                name,
                phone,
                role,
                status: client_1.UserStatus.PENDING,
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
        await this.mailerService.sendWelcomeEmail(email, name, tempPassword, otpCode);
        return user;
    }
    async findAll(query, tenantId, currentUser) {
        const { page = 1, limit = 20, search, role, status, sortBy = 'created_at', sortOrder = 'desc', } = query;
        const offset = (page - 1) * limit;
        const where = {
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
        if (currentUser.role !== client_1.UserRole.OWNER && currentUser.role !== client_1.UserRole.ADMIN) {
            if (currentUser.role === client_1.UserRole.VIEWER) {
            }
            else {
                where.id = currentUser.id;
            }
        }
        const total = await this.prisma.user.count({ where });
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
                ...(currentUser.role !== client_1.UserRole.OWNER && currentUser.role !== client_1.UserRole.ADMIN && {
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
    async findOne(id, tenantId) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, updateUserDto, tenantId, currentUser) {
        const { name, phone, role, status, permissions } = updateUserDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role !== client_1.UserRole.OWNER && currentUser.role !== client_1.UserRole.ADMIN) {
            if (currentUser.id !== id) {
                throw new common_1.ForbiddenException('You can only update your own profile');
            }
            if (role || status) {
                throw new common_1.ForbiddenException('You cannot change your role or status');
            }
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        if (permissions !== undefined)
            updateData.permissions = permissions;
        if (currentUser.role === client_1.UserRole.OWNER || currentUser.role === client_1.UserRole.ADMIN) {
            if (role !== undefined)
                updateData.role = role;
            if (status !== undefined)
                updateData.status = status;
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
    async remove(id, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { deleted_at: new Date() },
        });
    }
    async changeStatus(id, status, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { status },
        });
    }
    async resetPassword(id, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const tempPassword = this.generateRandomPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        await this.prisma.user.update({
            where: { id },
            data: {
                password_hash: passwordHash,
                password_changed_at: new Date(),
                refresh_tokens: [],
            },
        });
        await this.mailerService.sendPasswordResetNotification(user.email, user.name, tempPassword);
        return tempPassword;
    }
    async getStats(tenantId) {
        const [totalUsers, activeUsers, pendingUsers, usersByRole, recentLogins,] = await Promise.all([
            this.prisma.user.count({
                where: { deleted_at: null },
            }),
            this.prisma.user.count({
                where: { status: client_1.UserStatus.ACTIVE, deleted_at: null },
            }),
            this.prisma.user.count({
                where: { status: client_1.UserStatus.PENDING, deleted_at: null },
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                where: { deleted_at: null },
                _count: { role: true },
            }),
            this.prisma.user.count({
                where: {
                    last_login_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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
    generateRandomPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
    generateOtpCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], UsersService);
//# sourceMappingURL=users.service.js.map