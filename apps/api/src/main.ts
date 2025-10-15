import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
const compression = require('compression');
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { ErrorsFilter } from './common/filters/errors.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.useLogger(logger);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Compression
  app.use(compression());

  // CORS
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

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new ErrorsFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Tenant resolver middleware will be applied per-module through NestMiddleware

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
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