"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const invoices_controller_1 = require("./invoices.controller");
const invoices_service_1 = require("./invoices.service");
const prisma_module_1 = require("../database/prisma.module");
const tenant_resolver_middleware_1 = require("../common/middleware/tenant-resolver.middleware");
let InvoicesModule = class InvoicesModule {
    configure(consumer) {
        consumer
            .apply(tenant_resolver_middleware_1.TenantResolverMiddleware)
            .forRoutes(invoices_controller_1.InvoicesController);
    }
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [invoices_controller_1.InvoicesController],
        providers: [invoices_service_1.InvoicesService],
        exports: [invoices_service_1.InvoicesService],
    })
], InvoicesModule);
//# sourceMappingURL=invoices.module.js.map