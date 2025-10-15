"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const customers_controller_1 = require("./customers.controller");
const customers_service_1 = require("./customers.service");
const prisma_module_1 = require("../database/prisma.module");
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [customers_controller_1.CustomersController],
        providers: [customers_service_1.CustomersService],
        exports: [customers_service_1.CustomersService],
    })
], CustomersModule);
//# sourceMappingURL=customers.module.js.map