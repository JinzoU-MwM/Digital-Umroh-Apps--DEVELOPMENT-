"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bookings_service_1 = require("./bookings.service");
const booking_dto_1 = require("./dto/booking.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async create(createBookingDto, tenantId, req) {
        const booking = await this.bookingsService.create(createBookingDto, tenantId, req.user);
        return {
            data: booking,
            message: 'Booking created successfully',
        };
    }
    async findAll(query, tenantId, req) {
        const result = await this.bookingsService.findAll(query, tenantId, req.user);
        return {
            data: result.bookings,
            meta: {
                pagination: result.pagination,
                total: result.total,
            },
            message: 'Bookings retrieved successfully',
        };
    }
    async search(query, limit = 10, tenantId) {
        const bookings = await this.bookingsService.search(query, limit, tenantId);
        return {
            data: bookings,
            message: 'Search results retrieved successfully',
        };
    }
    async findOne(id, tenantId) {
        const booking = await this.bookingsService.findOne(id, tenantId);
        return {
            data: booking,
            message: 'Booking retrieved successfully',
        };
    }
    async getPilgrims(id, tenantId) {
        const pilgrims = await this.bookingsService.getPilgrims(id, tenantId);
        return {
            data: pilgrims,
            message: 'Pilgrims retrieved successfully',
        };
    }
    async update(id, updateBookingDto, tenantId, req) {
        const booking = await this.bookingsService.update(id, updateBookingDto, tenantId, req.user);
        return {
            data: booking,
            message: 'Booking updated successfully',
        };
    }
    async remove(id, tenantId) {
        await this.bookingsService.remove(id, tenantId);
        return {
            message: 'Booking deleted successfully',
        };
    }
    async confirm(id, tenantId) {
        const booking = await this.bookingsService.changeStatus(id, 'CONFIRMED', tenantId);
        return {
            data: booking,
            message: 'Booking confirmed successfully',
        };
    }
    async cancel(id, body, tenantId) {
        const booking = await this.bookingsService.cancel(id, body.reason, tenantId);
        return {
            data: booking,
            message: 'Booking cancelled successfully',
        };
    }
    async complete(id, tenantId) {
        const booking = await this.bookingsService.changeStatus(id, 'COMPLETED', tenantId);
        return {
            data: booking,
            message: 'Booking marked as completed',
        };
    }
    async addPilgrims(id, body, tenantId) {
        const pilgrims = await this.bookingsService.addPilgrims(id, body.pilgrims, tenantId);
        return {
            data: pilgrims,
            message: 'Pilgrims added successfully',
        };
    }
    async getStats(query, tenantId) {
        const stats = await this.bookingsService.getStats(query, tenantId);
        return {
            data: stats,
            message: 'Statistics retrieved successfully',
        };
    }
    async exportToExcel(query, tenantId) {
        const excelBuffer = await this.bookingsService.exportToExcel(query, tenantId);
        return {
            data: excelBuffer,
            message: 'Bookings exported successfully',
        };
    }
    async sendNotifications(id, body, tenantId) {
        await this.bookingsService.sendNotifications(id, body.type, tenantId);
        return {
            message: 'Notifications sent successfully',
        };
    }
    async getCalendar(year, month, tenantId) {
        const calendar = await this.bookingsService.getCalendar(year, month, tenantId);
        return {
            data: calendar,
            message: 'Calendar data retrieved successfully',
        };
    }
};
exports.BookingsController = BookingsController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Create new booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Booking created successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [booking_dto_1.CreateBookingDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings (paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [booking_dto_1.BookingQueryDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search bookings by code, customer name, or package' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)('q')),
    tslib_1.__param(1, (0, common_1.Query)('limit')),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "search", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Booking not found' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/pilgrims'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking pilgrims' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pilgrims retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "getPilgrims", null);
tslib_1.__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking updated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__param(3, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, booking_dto_1.UpdateBookingDto, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete booking (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking deleted successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "remove", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking confirmed successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "confirm", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel booking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking cancelled successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "cancel", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATION),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark booking as completed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Booking marked as completed' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "complete", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/add-pilgrims'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.SALES, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Add pilgrims to booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pilgrims added successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "addPilgrims", null);
tslib_1.__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "getStats", null);
tslib_1.__decorate([
    (0, common_1.Get)('export/excel'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.OPERATION),
    (0, swagger_1.ApiOperation)({ summary: 'Export bookings to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookings exported successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [booking_dto_1.BookingQueryDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "exportToExcel", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/send-notifications'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.OPERATION),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Send booking notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications sent successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "sendNotifications", null);
tslib_1.__decorate([
    (0, common_1.Get)('calendar/:year/:month'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking calendar for specific month' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calendar data retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('year')),
    tslib_1.__param(1, (0, common_1.Param)('month')),
    tslib_1.__param(2, (0, tenant_decorator_1.TenantId)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], BookingsController.prototype, "getCalendar", null);
exports.BookingsController = BookingsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('bookings'),
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    tslib_1.__metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map