"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const prisma_module_1 = require("../database/prisma.module");
const tenant_resolver_middleware_1 = require("../common/middleware/tenant-resolver.middleware");
const xendit_provider_1 = require("./providers/xendit.provider");
const midtrans_provider_1 = require("./providers/midtrans.provider");
const payment_gateway_service_1 = require("./services/payment-gateway.service");
let PaymentsModule = class PaymentsModule {
    configure(consumer) {
        consumer
            .apply(tenant_resolver_middleware_1.TenantResolverMiddleware)
            .forRoutes(payments_controller_1.PaymentsController);
    }
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [
            payments_service_1.PaymentsService,
            xendit_provider_1.XenditProvider,
            midtrans_provider_1.MidtransProvider,
            payment_gateway_service_1.PaymentGatewayService,
        ],
        exports: [payments_service_1.PaymentsService, payment_gateway_service_1.PaymentGatewayService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map