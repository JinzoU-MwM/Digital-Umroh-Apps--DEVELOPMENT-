"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const r2_storage_service_1 = require("./r2-storage.service");
const file_upload_controller_1 = require("./file-upload.controller");
const database_module_1 = require("../../database/database.module");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            database_module_1.DatabaseModule,
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 500 * 1024 * 1024,
                },
            }),
        ],
        providers: [r2_storage_service_1.R2StorageService],
        controllers: [file_upload_controller_1.FileUploadController],
        exports: [r2_storage_service_1.R2StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map