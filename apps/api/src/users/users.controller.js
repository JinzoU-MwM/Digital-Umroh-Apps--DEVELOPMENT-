"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./dto/user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto, tenantId) {
        const user = await this.usersService.create(createUserDto, tenantId);
        return {
            data: user,
            message: 'User created successfully',
        };
    }
    async findAll(query, tenantId, req) {
        const result = await this.usersService.findAll(query, tenantId, req.user);
        return {
            data: result.users,
            meta: {
                pagination: result.pagination,
                total: result.total,
            },
            message: 'Users retrieved successfully',
        };
    }
    async getProfile(req) {
        return {
            data: req.user,
            message: 'Profile retrieved successfully',
        };
    }
    async findOne(id, tenantId) {
        const user = await this.usersService.findOne(id, tenantId);
        return {
            data: user,
            message: 'User retrieved successfully',
        };
    }
    async update(id, updateUserDto, tenantId, req) {
        const user = await this.usersService.update(id, updateUserDto, tenantId, req.user);
        return {
            data: user,
            message: 'User updated successfully',
        };
    }
    async remove(id, tenantId) {
        await this.usersService.remove(id, tenantId);
        return {
            message: 'User deleted successfully',
        };
    }
    async activate(id, tenantId) {
        await this.usersService.changeStatus(id, 'ACTIVE', tenantId);
        return {
            message: 'User activated successfully',
        };
    }
    async deactivate(id, tenantId) {
        await this.usersService.changeStatus(id, 'INACTIVE', tenantId);
        return {
            message: 'User deactivated successfully',
        };
    }
    async resetPassword(id, tenantId) {
        const tempPassword = await this.usersService.resetPassword(id, tenantId);
        return {
            data: { temporaryPassword: tempPassword },
            message: 'Password reset successfully',
        };
    }
    async getStats(tenantId) {
        const stats = await this.usersService.getStats(tenantId);
        return {
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
};
exports.UsersController = UsersController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [user_dto_1.CreateUserDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [user_dto_1.UserQueryDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deactivated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "deactivate", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get users statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
exports.UsersController = UsersController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    tslib_1.__metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map