"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoles = exports.UserId = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'];
    return data ? user?.[data] : user;
});
exports.UserId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request['userId'];
});
exports.UserRoles = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request['userRoles'] || [];
});
//# sourceMappingURL=user.decorator.js.map