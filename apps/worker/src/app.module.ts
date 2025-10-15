import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './database/prisma.module';
import { QueuesModule } from './queues/queues.module';
import { ProcessorsModule } from './processors/processors.module';
import { ServicesModule } from './services/services.module';
import { loggerConfig } from './common/configs/logger.config';
import { redisConfig } from './common/configs/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Logging
    WinstonModule.forRoot(loggerConfig),

    // Database
    PrismaModule,

    // Queue (Redis + Bull)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService) => redisConfig(configService),
      inject: [ConfigService],
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Feature modules
    QueuesModule,
    ProcessorsModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}