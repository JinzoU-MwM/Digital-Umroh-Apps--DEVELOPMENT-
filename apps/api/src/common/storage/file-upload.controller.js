"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const r2_storage_service_1 = require("./r2-storage.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const tenant_service_1 = require("../../database/tenant.service");
const file_upload_dto_1 = require("./dto/file-upload.dto");
let FileUploadController = class FileUploadController {
    constructor(r2StorageService, tenantService) {
        this.r2StorageService = r2StorageService;
        this.tenantService = tenantService;
    }
    async uploadSingleFile(file, uploadDto, req) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        this.validateFile(file, uploadDto);
        const uploadOptions = {
            folder: uploadDto.folder || `tenant-${tenantId}`,
            isPublic: uploadDto.isPublic ?? true,
            metadata: {
                tenantId,
                uploadedBy: req.user.sub,
                category: uploadDto.category,
            },
        };
        return this.r2StorageService.uploadFile(file, uploadOptions);
    }
    async uploadMultipleFiles(files, uploadDto, req) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        files.forEach(file => this.validateFile(file, uploadDto));
        const uploadOptions = {
            folder: uploadDto.folder || `tenant-${tenantId}`,
            isPublic: uploadDto.isPublic ?? true,
            metadata: {
                tenantId,
                uploadedBy: req.user.sub,
                category: uploadDto.category,
            },
        };
        return this.r2StorageService.uploadFiles(files, uploadOptions);
    }
    async getUploadPresignedUrl(createPresignedUrlDto, req) {
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        const uploadOptions = {
            folder: createPresignedUrlDto.folder || `tenant-${tenantId}`,
        };
        return this.r2StorageService.getUploadPresignedUrl(createPresignedUrlDto.fileName, createPresignedUrlDto.contentType, uploadOptions);
    }
    async getDownloadPresignedUrl(key, query, req) {
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
            throw new common_1.BadRequestException('Access denied to this file');
        }
        const url = await this.r2StorageService.getDownloadPresignedUrl(key, {
            expiresIn: query.expiresIn || 3600,
        });
        return { url };
    }
    async listFiles(query, req) {
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        const folder = query.folder || `tenant-${tenantId}`;
        const files = await this.r2StorageService.listFiles(folder, query.maxKeys);
        return { files };
    }
    async getFileInfo(key, req) {
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
            throw new common_1.BadRequestException('Access denied to this file');
        }
        const fileInfo = await this.r2StorageService.getFileInfo(key);
        if (!fileInfo) {
            throw new common_1.BadRequestException('File not found');
        }
        return fileInfo;
    }
    async deleteFile(key, req) {
        const tenantId = this.tenantService.getTenantId(req);
        if (!tenantId) {
            throw new common_1.BadRequestException('Tenant context required');
        }
        if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
            throw new common_1.BadRequestException('Access denied to this file');
        }
        await this.r2StorageService.deleteFile(key);
        return { message: 'File deleted successfully' };
    }
    validateFile(file, uploadDto) {
        const allowedTypes = this.getAllowedFileTypes(uploadDto.category);
        if (!this.r2StorageService.validateFileType(file, allowedTypes)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed for category ${uploadDto.category}`);
        }
        const maxSizes = {
            image: 10 * 1024 * 1024,
            document: 50 * 1024 * 1024,
            video: 500 * 1024 * 1024,
            other: 100 * 1024 * 1024,
        };
        const maxSize = uploadDto.maxSize || maxSizes[uploadDto.category] || maxSizes.other;
        if (!this.r2StorageService.validateFileSize(file, maxSize)) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
        }
    }
    getAllowedFileTypes(category) {
        const types = {
            image: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ],
            document: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'text/csv',
            ],
            video: [
                'video/mp4',
                'video/mpeg',
                'video/quicktime',
                'video/webm',
            ],
            other: [
                'application/zip',
                'application/x-rar-compressed',
                'application/x-7z-compressed',
            ],
        };
        return types[category] || types.other;
    }
};
exports.FileUploadController = FileUploadController;
tslib_1.__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload single file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully', type: file_upload_dto_1.FileUploadDto }),
    tslib_1.__param(0, (0, common_1.UploadedFile)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, file_upload_dto_1.FileUploadDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadSingleFile", null);
tslib_1.__decorate([
    (0, common_1.Post)('upload/multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple files' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Files uploaded successfully', type: [file_upload_dto_1.FileUploadDto] }),
    tslib_1.__param(0, (0, common_1.UploadedFiles)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array, file_upload_dto_1.FileUploadDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadMultipleFiles", null);
tslib_1.__decorate([
    (0, common_1.Post)('presigned-url/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Get presigned URL for direct upload' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Presigned URL generated successfully' }),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [file_upload_dto_1.CreatePresignedUrlDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "getUploadPresignedUrl", null);
tslib_1.__decorate([
    (0, common_1.Get)('presigned-url/download/:key(*)'),
    (0, swagger_1.ApiOperation)({ summary: 'Get presigned URL for file download' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Presigned URL generated successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('key')),
    tslib_1.__param(1, (0, common_1.Query)()),
    tslib_1.__param(2, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "getDownloadPresignedUrl", null);
tslib_1.__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List files in folder' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files listed successfully' }),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [file_upload_dto_1.FileQueryDto, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "listFiles", null);
tslib_1.__decorate([
    (0, common_1.Get)('info/:key(*)'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File information retrieved successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('key')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFileInfo", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':key(*)'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File deleted successfully' }),
    tslib_1.__param(0, (0, common_1.Param)('key')),
    tslib_1.__param(1, (0, common_1.Request)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
exports.FileUploadController = FileUploadController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('File Upload'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [r2_storage_service_1.R2StorageService, typeof (_a = typeof tenant_service_1.TenantService !== "undefined" && tenant_service_1.TenantService) === "function" ? _a : Object])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map