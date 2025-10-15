import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
export declare const redisConfig: (configService: ConfigService) => RedisOptions;
