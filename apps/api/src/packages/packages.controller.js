"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackagesController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const packages_service_1 = require("./packages.service");
const package_dto_1 = require("./dto/package.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
let PackagesController = class PackagesController {
    constructor(packagesService) {
        this.packagesService = packagesService;
    }
    async create(createPackageDto, tenantId) {
        const packageData = await this.packagesService.create(createPackageDto, tenantId);
        return {
            data: packageData,
            message: 'Package created successfully',
        };
    }
    async findAll(query, tenantId, req) {
        const result = await this.packagesService.findAll(query, tenantId, req.user);
        return {
            data: result.packages,
            meta: {
                pagination: result.pagination,
                total: result.total,
            },
            message: 'Packages retrieved successfully',
        };
    }
    async findPublished(tenantId) {
        const packages = await this.packagesService.findPublished(tenantId);
        return {
            data: packages,
            message: 'Published packages retrieved successfully',
        };
    }
    async findOne(id, tenantId) {
        const packageData = await this.packagesService.findOne(id, tenantId);
        return {
            data: packageData,
            message: 'Package retrieved successfully',
        };
    }
    async update(id, updatePackageDto, tenantId) {
        const packageData = await this.packagesService.update(id, updatePackageDto, tenantId);
        return {
            data: packageData,
            message: 'Package updated successfully',
        };
    }
    async remove(id, tenantId) {
        await this.packagesService.remove(id, tenantId);
        return {
            message: 'Package deleted successfully',
        };
    }
    async publish(id, tenantId) {
        await this.packagesService.changeStatus(id, 'PUBLISHED', tenantId);
        return {
            message: 'Package published successfully',
        };
    }
    async unpublish(id, tenantId) {
        await this.packagesService.changeStatus(id, 'DRAFT', tenantId);
        return {
            message: 'Package unpublished successfully',
        };
    }
    async checkAvailability(id, tenantId) {
        const availability = await this.packagesService.checkAvailability(id, tenantId);
        return {
            data: availability,
            message: 'Package availability checked successfully',
        };
    }
    async getStats(tenantId) {
        const stats = await this.packagesService.getStats(tenantId);
        return {
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async duplicate(id, tenantId) {
        const packageData = await this.packagesService.duplicate(id, tenantId);
        return {
            data: packageData,
            message: 'Package duplicated successfully',
        };
    }
    async exportToExcel(tenantId, query) {
        const excelBuffer = await this.packagesService.exportToExcel(query, tenantId);
        return {
            data: excelBuffer,
            message: 'Packages exported successfully',
        };
    }
};
exports.PackagesController = PackagesController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new package' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Package created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [package_dto_1.CreatePackageDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all packages (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Packages retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [package_dto_1.PackageQueryDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('published'),
    (0, swagger_1.ApiOperation)({ summary: 'Get published packages for public view' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Published packages retrieved successfully' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "findPublished", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get package by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Package not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update package' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package updated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, package_dto_1.UpdatePackageDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete package (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package deleted successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Publish package' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package published successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "publish", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unpublish package' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package unpublished successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "unpublish", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Check package availability' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Availability checked successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "checkAvailability", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get packages statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Post)('duplicate/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate existing package' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Package duplicated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "duplicate", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/excel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Export packages to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Packages exported successfully' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(1, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, package_dto_1.PackageQueryDto]),
    tslib_1.__metadata("design:returntype", Promise)
], PackagesController.prototype, "exportToExcel", null);
exports.PackagesController = PackagesController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('packages'),
    (0, common_1.Controller)('packages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    tslib_1.__metadata("design:paramtypes", [packages_service_1.PackagesService])
], PackagesController);
//# sourceMappingURL=packages.controller.js.map