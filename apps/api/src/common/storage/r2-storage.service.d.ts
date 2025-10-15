import { ConfigService } from '@nestjs/config';
export interface FileUploadOptions {
    folder?: string;
    isPublic?: boolean;
    metadata?: Record<string, string>;
}
export interface UploadedFile {
    key: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
    etag?: string;
}
export interface PresignedUrlOptions {
    expiresIn?: number;
    contentType?: string;
}
export declare class R2StorageService {
    private configService;
    private readonly s3Client;
    private readonly bucketName;
    private readonly publicUrl;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, options?: FileUploadOptions): Promise<UploadedFile>;
    uploadFiles(files: Express.Multer.File[], options?: FileUploadOptions): Promise<UploadedFile[]>;
    getUploadPresignedUrl(fileName: string, contentType: string, options?: FileUploadOptions): Promise<{
        url: string;
        key: string;
    }>;
    getDownloadPresignedUrl(key: string, options?: PresignedUrlOptions): Promise<string>;
    deleteFile(key: string): Promise<void>;
    deleteFiles(keys: string[]): Promise<void>;
    listFiles(folder?: string, maxKeys?: number): Promise<string[]>;
    getFileUrl(key: string): string;
    validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean;
    validateFileSize(file: Express.Multer.File, maxSizeInBytes: number): boolean;
    getFileInfo(key: string): Promise<{
        size: number;
        lastModified: Date;
        contentType: string;
        etag: string;
    } | null>;
    copyFile(sourceKey: string, destinationKey: string): Promise<void>;
}
