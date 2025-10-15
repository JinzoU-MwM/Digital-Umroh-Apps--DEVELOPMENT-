"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("./mailer.service");
const config_1 = require("@nestjs/config");
let MailerModule = class MailerModule {
};
exports.MailerModule = MailerModule;
exports.MailerModule = MailerModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [mailer_service_1.MailerService],
        exports: [mailer_service_1.MailerService],
    })
], MailerModule);
//# sourceMappingURL=mailer.module.js.map