import { PrismaService } from '../database/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { MailerService } from '../shared/mailer/mailer.service';
import { UserStatus } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    private readonly mailerService;
    constructor(prisma: PrismaService, mailerService: MailerService);
    create(createUserDto: CreateUserDto, tenantId: string): Promise<{
        name: string;
        email: string;
        id: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        permissions: string[];
        email_verified_at: Date;
        created_at: Date;
    }>;
    findAll(query: UserQueryDto, tenantId: string, currentUser: any): Promise<{
        users: {
            name: string;
            email: string;
            id: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            permissions: string[];
            email_verified_at: Date;
            last_login_at: Date;
            created_at: Date;
            updated_at: Date;
        }[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    findOne(id: string, tenantId: string): Promise<{
        name: string;
        email: string;
        id: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatar_url: string;
        permissions: string[];
        email_verified_at: Date;
        last_login_at: Date;
        two_factor_enabled: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, tenantId: string, currentUser: any): Promise<{
        name: string;
        email: string;
        id: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        permissions: string[];
        email_verified_at: Date;
        updated_at: Date;
    }>;
    remove(id: string, tenantId: string): Promise<void>;
    changeStatus(id: string, status: UserStatus, tenantId: string): Promise<void>;
    resetPassword(id: string, tenantId: string): Promise<string>;
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        pending: number;
        inactive: number;
        byRole: {
            role: import(".prisma/client").$Enums.UserRole;
            count: number;
        }[];
        recentLogins: number;
    }>;
    private generateRandomPassword;
    private generateOtpCode;
}
