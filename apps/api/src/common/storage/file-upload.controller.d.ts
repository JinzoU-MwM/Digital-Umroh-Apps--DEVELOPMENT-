import { R2StorageService, UploadedFile as UploadedFileType } from './r2-storage.service';
import { TenantService } from '../../database/tenant.service';
import { CreatePresignedUrlDto, FileUploadDto, FileQueryDto } from './dto/file-upload.dto';
export declare class FileUploadController {
    private readonly r2StorageService;
    private readonly tenantService;
    constructor(r2StorageService: R2StorageService, tenantService: TenantService);
    uploadSingleFile(file: Express.Multer.File, uploadDto: FileUploadDto, req: any): Promise<UploadedFileType>;
    uploadMultipleFiles(files: Express.Multer.File[], uploadDto: FileUploadDto, req: any): Promise<UploadedFileType[]>;
    getUploadPresignedUrl(createPresignedUrlDto: CreatePresignedUrlDto, req: any): Promise<{
        url: string;
        key: string;
    }>;
    getDownloadPresignedUrl(key: string, query: {
        expiresIn?: number;
    }, req: any): Promise<{
        url: string;
    }>;
    listFiles(query: FileQueryDto, req: any): Promise<{
        files: string[];
    }>;
    getFileInfo(key: string, req: any): Promise<any>;
    deleteFile(key: string, req: any): Promise<{
        message: string;
    }>;
    private validateFile;
    private getAllowedFileTypes;
}
