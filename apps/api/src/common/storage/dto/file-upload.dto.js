"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFileResponse = exports.FileInfoResponse = exports.FileListResponse = exports.PresignedUrlResponse = exports.UploadedFileResponse = exports.FileQueryDto = exports.CreatePresignedUrlDto = exports.FileUploadDto = exports.FileCategory = void 0;
const tslib_1 = require("tslib");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var FileCategory;
(function (FileCategory) {
    FileCategory["IMAGE"] = "image";
    FileCategory["DOCUMENT"] = "document";
    FileCategory["VIDEO"] = "video";
    FileCategory["OTHER"] = "other";
})(FileCategory || (exports.FileCategory = FileCategory = {}));
class FileUploadDto {
    constructor() {
        this.category = FileCategory.IMAGE;
        this.isPublic = true;
    }
}
exports.FileUploadDto = FileUploadDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Folder path for file organization',
        example: 'package-images',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FileUploadDto.prototype, "folder", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File category for validation',
        enum: FileCategory,
        example: FileCategory.IMAGE,
        default: FileCategory.IMAGE,
    }),
    (0, class_validator_1.IsEnum)(FileCategory),
    tslib_1.__metadata("design:type", String)
], FileUploadDto.prototype, "category", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether file should be publicly accessible',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], FileUploadDto.prototype, "isPublic", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum file size in bytes',
        example: 10485760,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Max)(1048576000),
    (0, class_validator_1.Min)(1024),
    tslib_1.__metadata("design:type", Number)
], FileUploadDto.prototype, "maxSize", void 0);
class CreatePresignedUrlDto {
}
exports.CreatePresignedUrlDto = CreatePresignedUrlDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original file name',
        example: 'profile-picture.jpg',
    }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePresignedUrlDto.prototype, "fileName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content type of the file',
        example: 'image/jpeg',
    }),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePresignedUrlDto.prototype, "contentType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Folder path for file organization',
        example: 'profile-images',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePresignedUrlDto.prototype, "folder", void 0);
class FileQueryDto {
    constructor() {
        this.maxKeys = 1000;
    }
}
exports.FileQueryDto = FileQueryDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Folder path to list files from',
        example: 'package-images',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], FileQueryDto.prototype, "folder", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of files to return',
        example: 100,
        default: 1000,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Max)(10000),
    tslib_1.__metadata("design:type", Number)
], FileQueryDto.prototype, "maxKeys", void 0);
class UploadedFileResponse {
}
exports.UploadedFileResponse = UploadedFileResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File key in storage',
        example: 'tenant-123/abc123-def456.jpg',
    }),
    tslib_1.__metadata("design:type", String)
], UploadedFileResponse.prototype, "key", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Public URL of the file',
        example: 'https://storage.example.com/tenant-123/abc123-def456.jpg',
    }),
    tslib_1.__metadata("design:type", String)
], UploadedFileResponse.prototype, "url", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original file name',
        example: 'profile-picture.jpg',
    }),
    tslib_1.__metadata("design:type", String)
], UploadedFileResponse.prototype, "fileName", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type of the file',
        example: 'image/jpeg',
    }),
    tslib_1.__metadata("design:type", String)
], UploadedFileResponse.prototype, "mimeType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 1024000,
    }),
    tslib_1.__metadata("design:type", Number)
], UploadedFileResponse.prototype, "size", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ETag of the uploaded file',
        example: '"abc123def456"',
        required: false,
    }),
    tslib_1.__metadata("design:type", String)
], UploadedFileResponse.prototype, "etag", void 0);
class PresignedUrlResponse {
}
exports.PresignedUrlResponse = PresignedUrlResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Presigned URL for file upload/download',
        example: 'https://storage.example.com/upload?signature=...',
    }),
    tslib_1.__metadata("design:type", String)
], PresignedUrlResponse.prototype, "url", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File key that will be used',
        example: 'tenant-123/abc123-def456.jpg',
    }),
    tslib_1.__metadata("design:type", String)
], PresignedUrlResponse.prototype, "key", void 0);
class FileListResponse {
}
exports.FileListResponse = FileListResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file keys',
        example: ['tenant-123/file1.jpg', 'tenant-123/file2.jpg'],
        isArray: true,
    }),
    tslib_1.__metadata("design:type", Array)
], FileListResponse.prototype, "files", void 0);
class FileInfoResponse {
}
exports.FileInfoResponse = FileInfoResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 1024000,
    }),
    tslib_1.__metadata("design:type", Number)
], FileInfoResponse.prototype, "size", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last modified date',
        example: '2024-01-15T10:30:00Z',
    }),
    tslib_1.__metadata("design:type", Date)
], FileInfoResponse.prototype, "lastModified", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content type',
        example: 'image/jpeg',
    }),
    tslib_1.__metadata("design:type", String)
], FileInfoResponse.prototype, "contentType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ETag of the file',
        example: '"abc123def456"',
    }),
    tslib_1.__metadata("design:type", String)
], FileInfoResponse.prototype, "etag", void 0);
class DeleteFileResponse {
}
exports.DeleteFileResponse = DeleteFileResponse;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success message',
        example: 'File deleted successfully',
    }),
    tslib_1.__metadata("design:type", String)
], DeleteFileResponse.prototype, "message", void 0);
//# sourceMappingURL=file-upload.dto.js.map