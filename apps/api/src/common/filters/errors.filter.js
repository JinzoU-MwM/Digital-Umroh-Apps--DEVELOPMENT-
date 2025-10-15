"use strict";
var ErrorsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsFilter = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let ErrorsFilter = ErrorsFilter_1 = class ErrorsFilter {
    constructor() {
        this.logger = new common_1.Logger(ErrorsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let errors = [];
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else {
                message = exceptionResponse.message || exception.message;
                errors = exceptionResponse.errors || [];
            }
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            errors = [{ message: 'An unexpected error occurred' }];
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
        this.logger.error(`${request.method} ${request.url} - Status: ${status} - Message: ${message}`, exception instanceof Error ? exception.stack : exception);
        response.status(status).json(errorResponse);
    }
};
exports.ErrorsFilter = ErrorsFilter;
exports.ErrorsFilter = ErrorsFilter = ErrorsFilter_1 = tslib_1.__decorate([
    (0, common_1.Catch)()
], ErrorsFilter);
//# sourceMappingURL=errors.filter.js.map