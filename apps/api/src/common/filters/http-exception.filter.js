"use strict";
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        let message;
        let errors = [];
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        }
        else if (typeof exceptionResponse === 'object') {
            message = exceptionResponse.message || exception.message;
            if (status === common_1.HttpStatus.BAD_REQUEST && Array.isArray(exceptionResponse.message)) {
                errors = exceptionResponse.message.map((msg) => ({ message: msg }));
                message = 'Validation failed';
            }
            else {
                errors = exceptionResponse.errors || [];
            }
        }
        const errorResponse = {
            success: false,
            message,
            errors,
            meta: {
                timestamp: new Date().toISOString(),
                tenantId: request['tenantId'],
                userId: request['userId'],
                path: request.url,
                method: request.method,
                requestId: request.headers['x-request-id'],
            },
        };
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.url} - Status: ${status} - Message: ${message}`, exception.stack);
        }
        else {
            this.logger.warn(`${request.method} ${request.url} - Status: ${status} - Message: ${message}`);
        }
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = tslib_1.__decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map