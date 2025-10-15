"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
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
    async setTenantContext(tenantId) {
        await this.$executeRaw `SELECT set_config('app.current_tenant', ${tenantId}, false)`;
    }
    async withTenant(tenantId, callback) {
        await this.setTenantContext(tenantId);
        try {
            return await callback();
        }
        finally {
            await this.$executeRaw `SELECT set_config('app.current_tenant', '', false)`;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map