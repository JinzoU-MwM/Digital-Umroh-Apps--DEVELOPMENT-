"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PilgrimsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const pilgrims_controller_1 = require("./pilgrims.controller");
const pilgrims_service_1 = require("./pilgrims.service");
const prisma_module_1 = require("../database/prisma.module");
const tenant_resolver_middleware_1 = require("../common/middleware/tenant-resolver.middleware");
let PilgrimsModule = class PilgrimsModule {
    configure(consumer) {
        consumer
            .apply(tenant_resolver_middleware_1.TenantResolverMiddleware)
            .forRoutes(pilgrims_controller_1.PilgrimsController);
    }
};
exports.PilgrimsModule = PilgrimsModule;
exports.PilgrimsModule = PilgrimsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [pilgrims_controller_1.PilgrimsController],
        providers: [pilgrims_service_1.PilgrimsService],
        exports: [pilgrims_service_1.PilgrimsService],
    })
], PilgrimsModule);
//# sourceMappingURL=pilgrims.module.js.map