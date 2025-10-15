"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PilgrimsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pilgrims_service_1 = require("./pilgrims.service");
const pilgrim_dto_1 = require("./dto/pilgrim.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let PilgrimsController = class PilgrimsController {
    constructor(pilgrimsService) {
        this.pilgrimsService = pilgrimsService;
    }
    async create(createPilgrimDto, req) {
        const pilgrim = await this.pilgrimsService.create(createPilgrimDto, req.user.tenantId);
        return {
            success: true,
            data: pilgrim,
            message: 'Pilgrim created successfully',
        };
    }
    async bulkCreate(pilgrimsData, req) {
        const results = await this.pilgrimsService.bulkCreate(pilgrimsData, req.user.tenantId);
        return {
            success: true,
            data: results,
            message: 'Bulk creation completed',
        };
    }
    async findAll(query, req) {
        const result = await this.pilgrimsService.findAll(query, req.user.tenantId, req.user);
        return {
            success: true,
            data: result,
            message: 'Pilgrims retrieved successfully',
        };
    }
    async search(query, limit = 10, req) {
        const pilgrims = await this.pilgrimsService.search(query, limit, req.user.tenantId);
        return {
            success: true,
            data: pilgrims,
            message: 'Search results retrieved successfully',
        };
    }
    async getStats(req) {
        const stats = await this.pilgrimsService.getStats(req.user.tenantId);
        return {
            success: true,
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async exportToExcel(query, req, res) {
        const buffer = await this.pilgrimsService.exportToExcel(query, req.user.tenantId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=pilgrims.xlsx');
        res.send(buffer);
    }
    async findOne(id, req) {
        const pilgrim = await this.pilgrimsService.findOne(id, req.user.tenantId);
        return {
            success: true,
            data: pilgrim,
            message: 'Pilgrim retrieved successfully',
        };
    }
    async update(id, updatePilgrimDto, req) {
        const pilgrim = await this.pilgrimsService.update(id, updatePilgrimDto, req.user.tenantId, req.user);
        return {
            success: true,
            data: pilgrim,
            message: 'Pilgrim updated successfully',
        };
    }
    async remove(id, req) {
        await this.pilgrimsService.remove(id, req.user.tenantId);
        return {
            success: true,
            message: 'Pilgrim deleted successfully',
        };
    }
    async assignToBooking(pilgrimId, bookingId, req) {
        const pilgrim = await this.pilgrimsService.assignToBooking(pilgrimId, bookingId, req.user.tenantId);
        return {
            success: true,
            data: pilgrim,
            message: 'Pilgrim assigned to booking successfully',
        };
    }
    async removeFromBooking(pilgrimId, req) {
        const pilgrim = await this.pilgrimsService.removeFromBooking(pilgrimId, req.user.tenantId);
        return {
            success: true,
            data: pilgrim,
            message: 'Pilgrim removed from booking successfully',
        };
    }
};
exports.PilgrimsController = PilgrimsController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new pilgrim' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pilgrim created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Pilgrim already exists' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [pilgrim_dto_1.CreatePilgrimDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple pilgrims in bulk' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pilgrims created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "bulkCreate", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pilgrims with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrims retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [pilgrim_dto_1.PilgrimQueryDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Search pilgrims by name, ID, or phone' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)('q')),
    tslib_1.__param(1, (0, common_1.Query)('limit')),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get pilgrims statistics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/excel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Export pilgrims to Excel file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file exported successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__param(2, (0, common_1.Response)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [pilgrim_dto_1.PilgrimQueryDto, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "exportToExcel", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR, client_1.UserRole.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get pilgrim by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrim retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pilgrim not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pilgrim ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update pilgrim by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrim updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pilgrim not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Pilgrim data conflicts' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pilgrim ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, pilgrim_dto_1.UpdatePilgrimDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete pilgrim by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrim deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pilgrim not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pilgrim ID' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/assign-booking/:bookingId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Assign pilgrim to a booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrim assigned to booking successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pilgrim or booking not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pilgrim ID' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('bookingId')),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "assignToBooking", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/remove-booking'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Remove pilgrim from booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrim removed from booking successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pilgrim not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Pilgrim ID' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PilgrimsController.prototype, "removeFromBooking", null);
exports.PilgrimsController = PilgrimsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('pilgrims'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pilgrims'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    tslib_1.__metadata("design:paramtypes", [pilgrims_service_1.PilgrimsService])
], PilgrimsController);
//# sourceMappingURL=pilgrims.controller.js.map