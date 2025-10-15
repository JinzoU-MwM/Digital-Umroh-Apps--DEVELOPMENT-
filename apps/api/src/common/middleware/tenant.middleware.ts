import { Injectable, NestMiddleware, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from subdomain or header
    const tenantSlug = this.extractTenantSlug(req);

    if (!tenantSlug) {
      throw new ForbiddenException('Tenant identifier is required');
    }

    // Find tenant in database
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true, status: true, plan: true, limits: true, usage: true }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== 'ACTIVE') {
      throw new ForbiddenException(`Tenant is ${tenant.status.toLowerCase()}`);
    }

    // Set tenant context for RLS
    await this.prisma.setTenantContext(tenant.id);

    // Attach tenant info to request
    req['tenant'] = tenant;
    req['tenantId'] = tenant.id;
    req['tenantSlug'] = tenant.slug;

    next();
  }

  private extractTenantSlug(req: Request): string | null {
    // Try to get from header first
    const headerTenant = req.headers['x-tenant-id'] as string;
    if (headerTenant) {
      return headerTenant;
    }

    // Try to get from subdomain
    const host = req.headers.host;
    if (host) {
      // Extract subdomain (e.g., tenant.example.com -> tenant)
      const parts = host.split('.');
      if (parts.length > 2) {
        return parts[0];
      }
    }

    return null;
  }
}