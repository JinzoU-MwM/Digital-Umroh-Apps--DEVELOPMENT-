"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2StorageService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
let R2StorageService = class R2StorageService {
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.configService.get('S3_ENDPOINT'),
            region: this.configService.get('S3_REGION', 'auto'),
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
            },
        });
        this.bucketName = this.configService.get('S3_BUCKET');
        this.publicUrl = this.configService.get('S3_PUBLIC_URL') ||
            this.configService.get('S3_ENDPOINT')?.replace(/\/$/, '') + '/' + this.bucketName;
    }
    async uploadFile(file, options = {}) {
        const { folder = 'uploads', isPublic = true, metadata = {} } = options;
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${(0, crypto_1.randomUUID)()}.${fileExtension}`;
        const key = folder ? `${folder}/${fileName}` : fileName;
        const uploadParams = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentLength: file.size,
            Metadata: {
                originalName: file.originalname,
                uploadDate: new Date().toISOString(),
                tenantId: metadata.tenantId || 'default',
                ...metadata,
            },
            ACL: isPublic ? 'public-read' : 'private',
        };
        try {
            const result = await this.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
            return {
                key,
                url: this.getFileUrl(key),
                fileName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                etag: result.ETag,
            };
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async uploadFiles(files, options = {}) {
        const uploadPromises = files.map(file => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }
    async getUploadPresignedUrl(fileName, contentType, options = {}) {
        const { folder = 'uploads' } = options;
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${(0, crypto_1.randomUUID)()}.${fileExtension}`;
        const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
            Metadata: {
                originalName: fileName,
                uploadDate: new Date().toISOString(),
            },
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
        return { url, key };
    }
    async getDownloadPresignedUrl(key, options = {}) {
        const { expiresIn = 3600, contentType } = options;
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ResponseContentType: contentType,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async deleteFile(key) {
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
        }
        catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    async deleteFiles(keys) {
        const deletePromises = keys.map(key => this.deleteFile(key));
        await Promise.all(deletePromises);
    }
    async listFiles(folder, maxKeys = 1000) {
        try {
            const prefix = folder ? `${folder}/` : '';
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });
            const result = await this.s3Client.send(command);
            return result.Contents?.map(obj => obj.Key) || [];
        }
        catch (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }
    getFileUrl(key) {
        return `${this.publicUrl}/${key}`;
    }
    validateFileType(file, allowedTypes) {
        return allowedTypes.includes(file.mimetype);
    }
    validateFileSize(file, maxSizeInBytes) {
        return file.size <= maxSizeInBytes;
    }
    async getFileInfo(key) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const result = await this.s3Client.send(command);
            return {
                size: result.ContentLength || 0,
                lastModified: result.LastModified || new Date(),
                contentType: result.ContentType || 'application/octet-stream',
                etag: result.ETag || '',
            };
        }
        catch (error) {
            if (error.name === 'NoSuchKey') {
                return null;
            }
            throw new Error(`Failed to get file info: ${error.message}`);
        }
    }
    async copyFile(sourceKey, destinationKey) {
        try {
            const getCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: sourceKey,
            });
            const sourceObject = await this.s3Client.send(getCommand);
            const putCommand = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: destinationKey,
                Body: sourceObject.Body,
                ContentType: sourceObject.ContentType,
                Metadata: sourceObject.Metadata,
            });
            await this.s3Client.send(putCommand);
        }
        catch (error) {
            throw new Error(`Failed to copy file: ${error.message}`);
        }
    }
};
exports.R2StorageService = R2StorageService;
exports.R2StorageService = R2StorageService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService])
], R2StorageService);
//# sourceMappingURL=r2-storage.service.js.map