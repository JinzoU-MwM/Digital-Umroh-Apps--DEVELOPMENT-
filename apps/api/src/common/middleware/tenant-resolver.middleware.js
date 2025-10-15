"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantResolverMiddleware = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TenantResolverMiddleware = class TenantResolverMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        if (this.isPublicEndpoint(req.path)) {
            return next();
        }
        const tenantSlug = this.extractTenantSlug(req);
        if (!tenantSlug) {
            throw new common_1.ForbiddenException('Tenant identifier is required');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            select: {
                id: true,
                slug: true,
                status: true,
                plan: true,
                limits: true,
                usage: true,
                name: true,
                domain: true
            }
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
    isPublicEndpoint(path) {
        const publicPaths = [
            '/health',
            '/health/simple',
            '/auth/login',
            '/auth/register',
            '/auth/otp',
            '/auth/verify-otp',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/api/v1/health',
            '/api/v1/health/simple',
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/api/v1/auth/otp',
            '/api/v1/auth/verify-otp',
            '/api/v1/auth/forgot-password',
            '/api/v1/auth/reset-password',
        ];
        return publicPaths.some(publicPath => path.startsWith(publicPath));
    }
};
exports.TenantResolverMiddleware = TenantResolverMiddleware;
exports.TenantResolverMiddleware = TenantResolverMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantResolverMiddleware);
//# sourceMappingURL=tenant-resolver.middleware.js.map