"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackagesModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const packages_controller_1 = require("./packages.controller");
const packages_service_1 = require("./packages.service");
const prisma_module_1 = require("../database/prisma.module");
const tenant_resolver_middleware_1 = require("../common/middleware/tenant-resolver.middleware");
let PackagesModule = class PackagesModule {
    configure(consumer) {
        consumer
            .apply(tenant_resolver_middleware_1.TenantResolverMiddleware)
            .forRoutes(packages_controller_1.PackagesController);
    }
};
exports.PackagesModule = PackagesModule;
exports.PackagesModule = PackagesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [packages_controller_1.PackagesController],
        providers: [packages_service_1.PackagesService],
        exports: [packages_service_1.PackagesService],
    })
], PackagesModule);
//# sourceMappingURL=packages.module.js.map