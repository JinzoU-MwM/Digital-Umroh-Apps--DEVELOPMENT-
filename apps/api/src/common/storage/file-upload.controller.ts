import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  Get,
  Delete,
  Param,
  Query,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { R2StorageService, UploadedFile as UploadedFileType } from './r2-storage.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantService } from '../../database/tenant.service';
import { CreatePresignedUrlDto, FileUploadDto, FileQueryDto } from './dto/file-upload.dto';

@ApiTags('File Upload')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(
    private readonly r2StorageService: R2StorageService,
    private readonly tenantService: TenantService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileUploadDto })
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto,
    @Request() req,
  ): Promise<UploadedFileType> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    // Validate file
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

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully', type: [FileUploadDto] })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: FileUploadDto,
    @Request() req,
  ): Promise<UploadedFileType[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    // Validate all files
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

  @Post('presigned-url/upload')
  @ApiOperation({ summary: 'Get presigned URL for direct upload' })
  @ApiResponse({ status: 201, description: 'Presigned URL generated successfully' })
  async getUploadPresignedUrl(
    @Body() createPresignedUrlDto: CreatePresignedUrlDto,
    @Request() req,
  ): Promise<{ url: string; key: string }> {
    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    const uploadOptions = {
      folder: createPresignedUrlDto.folder || `tenant-${tenantId}`,
    };

    return this.r2StorageService.getUploadPresignedUrl(
      createPresignedUrlDto.fileName,
      createPresignedUrlDto.contentType,
      uploadOptions,
    );
  }

  @Get('presigned-url/download/:key(*)')
  @ApiOperation({ summary: 'Get presigned URL for file download' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async getDownloadPresignedUrl(
    @Param('key') key: string,
    @Query() query: { expiresIn?: number },
    @Request() req,
  ): Promise<{ url: string }> {
    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    // Verify tenant access to file
    if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
      throw new BadRequestException('Access denied to this file');
    }

    const url = await this.r2StorageService.getDownloadPresignedUrl(key, {
      expiresIn: query.expiresIn || 3600,
    });

    return { url };
  }

  @Get('list')
  @ApiOperation({ summary: 'List files in folder' })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  async listFiles(
    @Query() query: FileQueryDto,
    @Request() req,
  ): Promise<{ files: string[] }> {
    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    const folder = query.folder || `tenant-${tenantId}`;
    const files = await this.r2StorageService.listFiles(folder, query.maxKeys);

    return { files };
  }

  @Get('info/:key(*)')
  @ApiOperation({ summary: 'Get file information' })
  @ApiResponse({ status: 200, description: 'File information retrieved successfully' })
  async getFileInfo(
    @Param('key') key: string,
    @Request() req,
  ): Promise<any> {
    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    // Verify tenant access to file
    if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
      throw new BadRequestException('Access denied to this file');
    }

    const fileInfo = await this.r2StorageService.getFileInfo(key);
    if (!fileInfo) {
      throw new BadRequestException('File not found');
    }

    return fileInfo;
  }

  @Delete(':key(*)')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(
    @Param('key') key: string,
    @Request() req,
  ): Promise<{ message: string }> {
    // Get tenant context
    const tenantId = this.tenantService.getTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Tenant context required');
    }

    // Verify tenant access to file
    if (!key.includes(`tenant-${tenantId}/`) && !key.startsWith('public/')) {
      throw new BadRequestException('Access denied to this file');
    }

    await this.r2StorageService.deleteFile(key);

    return { message: 'File deleted successfully' };
  }

  private validateFile(file: Express.Multer.File, uploadDto: FileUploadDto): void {
    // Define allowed file types based on category
    const allowedTypes = this.getAllowedFileTypes(uploadDto.category);

    if (!this.r2StorageService.validateFileType(file, allowedTypes)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed for category ${uploadDto.category}`,
      );
    }

    // Define max file size based on category (in bytes)
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      document: 50 * 1024 * 1024, // 50MB
      video: 500 * 1024 * 1024, // 500MB
      other: 100 * 1024 * 1024, // 100MB
    };

    const maxSize = uploadDto.maxSize || maxSizes[uploadDto.category] || maxSizes.other;

    if (!this.r2StorageService.validateFileSize(file, maxSize)) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }
  }

  private getAllowedFileTypes(category: string): string[] {
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
}