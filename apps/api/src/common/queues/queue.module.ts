import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { MailProcessor } from './mail.processor';
import { NotificationProcessor } from './notification.processor';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
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
      },
      {
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
      },
    ),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: parseInt(configService.get<string>('SMTP_PORT') || '587'),
          secure: configService.get<string>('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('EMAIL_FROM', 'noreply@digital-umroh.com'),
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
    ConfigModule,
    PrismaModule,
  ],
  providers: [MailProcessor, NotificationProcessor, QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}