"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../database/prisma.module");
const mail_processor_1 = require("./mail.processor");
const notification_processor_1 = require("./notification.processor");
const queue_service_1 = require("./queue.service");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'mail',
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
                defaultJobOptions: {
                    removeOnComplete: 100,
                    removeOnFail: 50,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            }, {
                name: 'notification',
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
                defaultJobOptions: {
                    removeOnComplete: 100,
                    removeOnFail: 50,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    transport: {
                        host: configService.get('SMTP_HOST'),
                        port: parseInt(configService.get('SMTP_PORT') || '587'),
                        secure: configService.get('SMTP_SECURE') === 'true',
                        auth: {
                            user: configService.get('SMTP_USER'),
                            pass: configService.get('SMTP_PASS'),
                        },
                    },
                    defaults: {
                        from: configService.get('EMAIL_FROM', 'noreply@digital-umroh.com'),
                    },
                    template: {
                        dir: process.cwd() + '/templates',
                        adapter: 'handlebars',
                        options: {
                            strict: true,
                        },
                    },
                }),
                inject: [ConfigService],
            }),
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
        ],
        providers: [mail_processor_1.MailProcessor, notification_processor_1.NotificationProcessor, queue_service_1.QueueService],
        exports: [queue_service_1.QueueService, bull_1.BullModule],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map