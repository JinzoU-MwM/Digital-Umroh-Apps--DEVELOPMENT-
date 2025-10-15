import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, Max, Min } from 'class-validator';

export enum FileCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other',
}

export class FileUploadDto {
  @ApiProperty({
    description: 'Folder path for file organization',
    example: 'package-images',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({
    description: 'File category for validation',
    enum: FileCategory,
    example: FileCategory.IMAGE,
    default: FileCategory.IMAGE,
  })
  @IsEnum(FileCategory)
  category: FileCategory = FileCategory.IMAGE;

  @ApiProperty({
    description: 'Whether file should be publicly accessible',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @ApiProperty({
    description: 'Maximum file size in bytes',
    example: 10485760, // 10MB
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Max(1048576000) // Max 1GB
  @Min(1024) // Min 1KB
  maxSize?: number;
}

export class CreatePresignedUrlDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'profile-picture.jpg',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'Content type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: 'Folder path for file organization',
    example: 'profile-images',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class FileQueryDto {
  @ApiProperty({
    description: 'Folder path to list files from',
    example: 'package-images',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiProperty({
    description: 'Maximum number of files to return',
    example: 100,
    default: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Max(10000)
  maxKeys?: number = 1000;
}

export class UploadedFileResponse {
  @ApiProperty({
    description: 'File key in storage',
    example: 'tenant-123/abc123-def456.jpg',
  })
  key: string;

  @ApiProperty({
    description: 'Public URL of the file',
    example: 'https://storage.example.com/tenant-123/abc123-def456.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'profile-picture.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'ETag of the uploaded file',
    example: '"abc123def456"',
    required: false,
  })
  etag?: string;
}

export class PresignedUrlResponse {
  @ApiProperty({
    description: 'Presigned URL for file upload/download',
    example: 'https://storage.example.com/upload?signature=...',
  })
  url: string;

  @ApiProperty({
    description: 'File key that will be used',
    example: 'tenant-123/abc123-def456.jpg',
  })
  key: string;
}

export class FileListResponse {
  @ApiProperty({
    description: 'Array of file keys',
    example: ['tenant-123/file1.jpg', 'tenant-123/file2.jpg'],
    isArray: true,
  })
  files: string[];
}

export class FileInfoResponse {
  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Last modified date',
    example: '2024-01-15T10:30:00Z',
  })
  lastModified: Date;

  @ApiProperty({
    description: 'Content type',
    example: 'image/jpeg',
  })
  contentType: string;

  @ApiProperty({
    description: 'ETag of the file',
    example: '"abc123def456"',
  })
  etag: string;
}

export class DeleteFileResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'File deleted successfully',
  })
  message: string;
}