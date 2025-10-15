"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bull_1 = require("@nestjs/bull");
const nest_winston_1 = require("nest-winston");
const prisma_module_1 = require("./database/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const packages_module_1 = require("./packages/packages.module");
const customers_module_1 = require("./customers/customers.module");
const bookings_module_1 = require("./bookings/bookings.module");
const pilgrims_module_1 = require("./pilgrims/pilgrims.module");
const invoices_module_1 = require("./invoices/invoices.module");
const payments_module_1 = require("./payments/payments.module");
const health_module_1 = require("./common/health/health.module");
const queue_module_1 = require("./common/queues/queue.module");
const logger_config_1 = require("./common/configs/logger.config");
const redis_config_1 = require("./common/configs/redis.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            nest_winston_1.WinstonModule.forRoot(logger_config_1.loggerConfig),
            prisma_module_1.PrismaModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    redis: (0, redis_config_1.redisConfig)(configService),
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            packages_module_1.PackagesModule,
            customers_module_1.CustomersModule,
            bookings_module_1.BookingsModule,
            pilgrims_module_1.PilgrimsModule,
            invoices_module_1.InvoicesModule,
            payments_module_1.PaymentsModule,
            health_module_1.HealthModule,
            queue_module_1.QueueModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map