import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.useLogger(logger);

  logger.log('🚀 Digital Umroh Worker is starting...');
  logger.log(`📊 Environment: ${configService.get('NODE_ENV', 'development')}`);

  await app.listen(configService.get('PORT', 3002));

  logger.log(`✅ Worker is running on port: ${configService.get('PORT', 3002)}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});