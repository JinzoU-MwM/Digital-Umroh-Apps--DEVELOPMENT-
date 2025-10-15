"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression = require('compression');
const nest_winston_1 = require("nest-winston");
const app_module_1 = require("./app.module");
const response_transform_interceptor_1 = require("./common/interceptors/response-transform.interceptor");
const errors_filter_1 = require("./common/filters/errors.filter");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    app.use(compression());
    app.enableCors({
        origin: [
            configService.get('CORS_ORIGIN') || 'http://localhost:3000',
            /^https?:\/\/localhost:\d+$/,
            /^https?:\/\/.*\.appmu\.com$/,
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Tenant-Id',
            'X-Idempotency-Key',
        ],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new errors_filter_1.ErrorsFilter(), new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_transform_interceptor_1.ResponseTransformInterceptor());
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Digital Umroh API')
            .setDescription('SaaS Travel Umrah-Haji Platform API Documentation')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token',
        })
            .addApiKey({
            type: 'apiKey',
            name: 'X-Tenant-Id',
            in: 'header',
            description: 'Tenant identifier (slug or ID)',
        })
            .addTag('auth', 'Authentication & Authorization')
            .addTag('tenants', 'Tenant Management')
            .addTag('users', 'User Management')
            .addTag('packages', 'Package Management')
            .addTag('customers', 'Customer Management')
            .addTag('bookings', 'Booking Management')
            .addTag('pilgrims', 'Pilgrim Management')
            .addTag('invoices', 'Invoice Management')
            .addTag('payments', 'Payment Management')
            .addTag('notifications', 'Notification Management')
            .addTag('reports', 'Reports & Analytics')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
            },
        });
        logger.log(`Swagger documentation available at http://localhost:${configService.get('PORT', 3001)}/${apiPrefix}/docs`);
    }
    const port = configService.get('PORT', 3001);
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📊 Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map