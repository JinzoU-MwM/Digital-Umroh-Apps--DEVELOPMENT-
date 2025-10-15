"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = void 0;
const redisConfig = (configService) => ({
    host: configService.get('REDIS_HOST', 'localhost'),
    port: configService.get('REDIS_PORT', 6379),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB', 0),
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    ...(process.env.NODE_ENV === 'production' && {
        connectTimeout: 10000,
        commandTimeout: 5000,
        maxRetriesPerRequest: 3,
    }),
});
exports.redisConfig = redisConfig;
//# sourceMappingURL=redis.config.js.map