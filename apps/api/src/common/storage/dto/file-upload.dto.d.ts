export declare enum FileCategory {
    IMAGE = "image",
    DOCUMENT = "document",
    VIDEO = "video",
    OTHER = "other"
}
export declare class FileUploadDto {
    folder?: string;
    category: FileCategory;
    isPublic?: boolean;
    maxSize?: number;
}
export declare class CreatePresignedUrlDto {
    fileName: string;
    contentType: string;
    folder?: string;
}
export declare class FileQueryDto {
    folder?: string;
    maxKeys?: number;
}
export declare class UploadedFileResponse {
    key: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
    etag?: string;
}
export declare class PresignedUrlResponse {
    url: string;
    key: string;
}
export declare class FileListResponse {
    files: string[];
}
export declare class FileInfoResponse {
    size: number;
    lastModified: Date;
    contentType: string;
    etag: string;
}
export declare class DeleteFileResponse {
    message: string;
}
