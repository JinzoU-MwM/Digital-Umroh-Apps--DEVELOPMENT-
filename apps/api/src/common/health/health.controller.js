"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const prisma_service_1 = require("../../database/prisma.service");
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    constructor(health, prisma, configService) {
        this.health = health;
        this.prisma = prisma;
        this.configService = configService;
    }
    async check() {
        return this.health.check([
            () => this.checkDatabase(),
            () => this.checkMemory(),
            () => this.checkEnvironment(),
        ]);
    }
    async simpleCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: this.configService.get('NODE_ENV', 'development'),
            version: process.env.npm_package_version || '1.0.0',
        };
    }
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                database: {
                    status: 'up',
                    info: { database: this.configService.get('DATABASE_URL')?.split('@')[1] },
                },
            };
        }
        catch (error) {
            return {
                database: {
                    status: 'down',
                    error: error.message,
                },
            };
        }
    }
    async checkMemory() {
        const memUsage = process.memoryUsage();
        const totalMem = memUsage.heapTotal / 1024 / 1024;
        const usedMem = memUsage.heapUsed / 1024 / 1024;
        return {
            memory: {
                status: 'up',
                info: {
                    total: `${totalMem.toFixed(2)} MB`,
                    used: `${usedMem.toFixed(2)} MB`,
                    percentage: `${((usedMem / totalMem) * 100).toFixed(2)}%`,
                },
            },
        };
    }
    async checkEnvironment() {
        const requiredEnvVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'REDIS_URL',
        ];
        const missing = requiredEnvVars.filter(envVar => !this.configService.get(envVar));
        return {
            environment: {
                status: missing.length === 0 ? 'up' : 'down',
                info: {
                    nodeEnv: this.configService.get('NODE_ENV', 'development'),
                    missing: missing.length > 0 ? missing : undefined,
                },
            },
        };
    }
};
exports.HealthController = HealthController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
tslib_1.__decorate([
    (0, common_1.Get)('simple'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HealthController.prototype, "simpleCheck", null);
exports.HealthController = HealthController = tslib_1.__decorate([
    (0, common_1.Controller)('health'),
    tslib_1.__metadata("design:paramtypes", [terminus_1.HealthCheckService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], HealthController);
//# sourceMappingURL=health.controller.js.map