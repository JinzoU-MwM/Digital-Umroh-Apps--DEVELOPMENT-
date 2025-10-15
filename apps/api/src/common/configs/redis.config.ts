import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const redisConfig = (configService: ConfigService): RedisOptions => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  db: configService.get<number>('REDIS_DB', 0),
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  // Add connection options for production
  ...(process.env.NODE_ENV === 'production' && {
    connectTimeout: 10000,
    commandTimeout: 5000,
    maxRetriesPerRequest: 3,
  }),
});