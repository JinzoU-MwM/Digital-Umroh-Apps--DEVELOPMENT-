"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bookings_controller_1 = require("./bookings.controller");
const bookings_service_1 = require("./bookings.service");
const prisma_module_1 = require("../database/prisma.module");
let BookingsModule = class BookingsModule {
};
exports.BookingsModule = BookingsModule;
exports.BookingsModule = BookingsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [bookings_controller_1.BookingsController],
        providers: [bookings_service_1.BookingsService],
        exports: [bookings_service_1.BookingsService],
    })
], BookingsModule);
//# sourceMappingURL=bookings.module.js.map