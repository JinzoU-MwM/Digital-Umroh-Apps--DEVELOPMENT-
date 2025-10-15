"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const invoice_dto_1 = require("./dto/invoice.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let InvoicesController = class InvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async create(createInvoiceDto, req) {
        const invoice = await this.invoicesService.create(createInvoiceDto, req.user.tenantId);
        return {
            success: true,
            data: invoice,
            message: 'Invoice created successfully',
        };
    }
    async findAll(query, req) {
        const result = await this.invoicesService.findAll(query, req.user.tenantId, req.user);
        return {
            success: true,
            data: result,
            message: 'Invoices retrieved successfully',
        };
    }
    async getStats(req) {
        const stats = await this.invoicesService.getStats(req.user.tenantId);
        return {
            success: true,
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async findOne(id, req) {
        const invoice = await this.invoicesService.findOne(id, req.user.tenantId);
        return {
            success: true,
            data: invoice,
            message: 'Invoice retrieved successfully',
        };
    }
    async update(id, updateInvoiceDto, req) {
        const invoice = await this.invoicesService.update(id, updateInvoiceDto, req.user.tenantId, req.user);
        return {
            success: true,
            data: invoice,
            message: 'Invoice updated successfully',
        };
    }
    async sendInvoice(id, req) {
        const invoice = await this.invoicesService.sendInvoice(id, req.user.tenantId);
        return {
            success: true,
            data: invoice,
            message: 'Invoice sent successfully',
        };
    }
    async cancel(id, req) {
        const invoice = await this.invoicesService.cancel(id, req.user.tenantId);
        return {
            success: true,
            data: invoice,
            message: 'Invoice cancelled successfully',
        };
    }
};
exports.InvoicesController = InvoicesController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invoice created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [invoice_dto_1.CreateInvoiceDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoices retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [invoice_dto_1.InvoiceQueryDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoices statistics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Invoice ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update invoice by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invoice cannot be updated' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Invoice ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, invoice_dto_1.UpdateInvoiceDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/send'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Send invoice to customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invoice cannot be sent' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Invoice ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendInvoice", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an invoice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invoice cannot be cancelled' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Invoice ID' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoicesController.prototype, "cancel", null);
exports.InvoicesController = InvoicesController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    tslib_1.__metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map