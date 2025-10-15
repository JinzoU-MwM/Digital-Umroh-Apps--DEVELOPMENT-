"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const customer_dto_1 = require("./dto/customer.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
let CustomersController = class CustomersController {
    constructor(customersService) {
        this.customersService = customersService;
    }
    async create(createCustomerDto, tenantId) {
        const customer = await this.customersService.create(createCustomerDto, tenantId);
        return {
            data: customer,
            message: 'Customer created successfully',
        };
    }
    async findAll(query, tenantId, req) {
        const result = await this.customersService.findAll(query, tenantId, req.user);
        return {
            data: result.customers,
            meta: {
                pagination: result.pagination,
                total: result.total,
            },
            message: 'Customers retrieved successfully',
        };
    }
    async search(query, limit = 10, tenantId) {
        const customers = await this.customersService.search(query, limit, tenantId);
        return {
            data: customers,
            message: 'Search results retrieved successfully',
        };
    }
    async findOne(id, tenantId) {
        const customer = await this.customersService.findOne(id, tenantId);
        return {
            data: customer,
            message: 'Customer retrieved successfully',
        };
    }
    async getBookingHistory(id, query, tenantId) {
        const result = await this.customersService.getBookingHistory(id, query, tenantId);
        return {
            data: result.bookings,
            meta: {
                pagination: result.pagination,
                total: result.total,
            },
            message: 'Booking history retrieved successfully',
        };
    }
    async update(id, updateCustomerDto, tenantId, req) {
        const customer = await this.customersService.update(id, updateCustomerDto, tenantId, req.user);
        return {
            data: customer,
            message: 'Customer updated successfully',
        };
    }
    async remove(id, tenantId) {
        await this.customersService.remove(id, tenantId);
        return {
            message: 'Customer deleted successfully',
        };
    }
    async import(importData, tenantId) {
        const result = await this.customersService.importCustomers(importData.customers, tenantId);
        return {
            data: result,
            message: 'Customers imported successfully',
        };
    }
    async exportToExcel(query, tenantId) {
        const excelBuffer = await this.customersService.exportToExcel(query, tenantId);
        return {
            data: excelBuffer,
            message: 'Customers exported successfully',
        };
    }
    async getStats(tenantId) {
        const stats = await this.customersService.getStats(tenantId);
        return {
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async merge(primaryId, body, tenantId) {
        const customer = await this.customersService.mergeCustomers(primaryId, body.duplicateId, tenantId);
        return {
            data: customer,
            message: 'Customers merged successfully',
        };
    }
    async findDuplicates(tenantId) {
        const duplicates = await this.customersService.findDuplicates(tenantId);
        return {
            data: duplicates,
            message: 'Potential duplicates retrieved successfully',
        };
    }
};
exports.CustomersController = CustomersController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Create new customer' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Customer created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [customer_dto_1.CreateCustomerDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customers retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [customer_dto_1.CustomerQueryDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search customers by name, email, phone, or ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)('q')),
    tslib_1.__param(1, (0, common_1.Query)('limit')),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer booking history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking history retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Query)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "getBookingHistory", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer updated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, customer_dto_1.UpdateCustomerDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete customer (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer deleted successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES),
    (0, swagger_1.ApiOperation)({ summary: 'Import customers from CSV/Excel' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Customers imported successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "import", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/excel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Export customers to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customers exported successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [customer_dto_1.CustomerQueryDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "exportToExcel", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/merge'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Merge duplicate customers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customers merged successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "merge", null);
tslib_1.__decorate([
    (0, common_1.Get)('duplicates/find'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Find potential duplicate customers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Potential duplicates found' }),
    tslib_1.__param(0, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], CustomersController.prototype, "findDuplicates", null);
exports.CustomersController = CustomersController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    tslib_1.__metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map