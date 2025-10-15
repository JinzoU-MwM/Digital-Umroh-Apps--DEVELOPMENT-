import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private health;
    private prisma;
    private configService;
    constructor(health: HealthCheckService, prisma: PrismaService, configService: ConfigService);
    check(): Promise<HealthCheckResult>;
    simpleCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        environment: any;
        version: string;
    }>;
    private checkDatabase;
    private checkMemory;
    private checkEnvironment;
}
