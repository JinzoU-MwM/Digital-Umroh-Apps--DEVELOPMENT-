"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        const tenantSlug = this.extractTenantSlug(req);
        if (!tenantSlug) {
            throw new common_1.ForbiddenException('Tenant identifier is required');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            select: { id: true, slug: true, status: true, plan: true, limits: true, usage: true }
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        if (tenant.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException(`Tenant is ${tenant.status.toLowerCase()}`);
        }
        await this.prisma.setTenantContext(tenant.id);
        req['tenant'] = tenant;
        req['tenantId'] = tenant.id;
        req['tenantSlug'] = tenant.slug;
        next();
    }
    extractTenantSlug(req) {
        const headerTenant = req.headers['x-tenant-id'];
        if (headerTenant) {
            return headerTenant;
        }
        const host = req.headers.host;
        if (host) {
            const parts = host.split('.');
            if (parts.length > 2) {
                return parts[0];
            }
        }
        return null;
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map