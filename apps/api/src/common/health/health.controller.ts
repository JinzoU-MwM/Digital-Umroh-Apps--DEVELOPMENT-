import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkMemory(),
      () => this.checkEnvironment(),
    ]);
  }

  @Get('simple')
  async simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV', 'development'),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        database: {
          status: 'up',
          info: { database: this.configService.get('DATABASE_URL')?.split('@')[1] },
        },
      };
    } catch (error) {
      return {
        database: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }

  private async checkMemory(): Promise<HealthIndicatorResult> {
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

  private async checkEnvironment(): Promise<HealthIndicatorResult> {
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'REDIS_URL',
    ];

    const missing = requiredEnvVars.filter(
      envVar => !this.configService.get(envVar),
    );

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
}