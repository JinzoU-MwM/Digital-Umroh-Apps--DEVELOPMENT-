import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { CustomersModule } from './customers/customers.module';
import { BookingsModule } from './bookings/bookings.module';
import { PilgrimsModule } from './pilgrims/pilgrims.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './common/health/health.module';
import { QueueModule } from './common/queues/queue.module';
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

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Queue (Redis + Bull)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: redisConfig(configService),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    PackagesModule,
    CustomersModule,
    BookingsModule,
    PilgrimsModule,
    InvoicesModule,
    PaymentsModule,
    HealthModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}