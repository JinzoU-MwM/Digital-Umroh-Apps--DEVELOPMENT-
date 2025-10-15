"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformInterceptor = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ResponseTransformInterceptor = class ResponseTransformInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        return next.handle().pipe((0, operators_1.map)((data) => ({
            success: true,
            data,
            message: data?.message || 'Success',
            meta: {
                timestamp: new Date().toISOString(),
                tenantId: request['tenantId'],
                userId: request['userId'],
                requestId: request.headers['x-request-id'] || response.id,
            },
        })));
    }
};
exports.ResponseTransformInterceptor = ResponseTransformInterceptor;
exports.ResponseTransformInterceptor = ResponseTransformInterceptor = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ResponseTransformInterceptor);
//# sourceMappingURL=response-transform.interceptor.js.map