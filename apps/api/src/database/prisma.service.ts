import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to set tenant context for RLS
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, false)`;
  }

  // Helper method to execute queries with tenant context
  async withTenant<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    await this.setTenantContext(tenantId);
    try {
      return await callback();
    } finally {
      // Reset tenant context
      await this.$executeRaw`SELECT set_config('app.current_tenant', '', false)`;
    }
  }
}