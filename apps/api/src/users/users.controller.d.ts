import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, tenantId: string): Promise<{
        data: {
            name: string;
            email: string;
            id: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            permissions: string[];
            email_verified_at: Date;
            created_at: Date;
        };
        message: string;
    }>;
    findAll(query: UserQueryDto, tenantId: string, req: any): Promise<{
        data: {
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
        meta: {
            pagination: {
                page: number;
                limit: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
            total: number;
        };
        message: string;
    }>;
    getProfile(req: any): Promise<{
        data: any;
        message: string;
    }>;
    findOne(id: string, tenantId: string): Promise<{
        data: {
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
        };
        message: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, tenantId: string, req: any): Promise<{
        data: {
            name: string;
            email: string;
            id: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            permissions: string[];
            email_verified_at: Date;
            updated_at: Date;
        };
        message: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    activate(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    deactivate(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    resetPassword(id: string, tenantId: string): Promise<{
        data: {
            temporaryPassword: string;
        };
        message: string;
    }>;
    getStats(tenantId: string): Promise<{
        data: {
            total: number;
            active: number;
            pending: number;
            inactive: number;
            byRole: {
                role: import(".prisma/client").$Enums.UserRole;
                count: number;
            }[];
            recentLogins: number;
        };
        message: string;
    }>;
}
