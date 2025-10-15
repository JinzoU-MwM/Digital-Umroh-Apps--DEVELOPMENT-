"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSlug = exports.TenantId = exports.Tenant = void 0;
const common_1 = require("@nestjs/common");
exports.Tenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request['tenant'];
    return data ? tenant?.[data] : tenant;
});
exports.TenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request['tenantId'];
});
exports.TenantSlug = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request['tenantSlug'];
});
//# sourceMappingURL=tenant.decorator.js.map