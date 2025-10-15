import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

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
  expiresIn?: number; // seconds
  contentType?: string;
}

@Injectable()
export class R2StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION', 'auto'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>('S3_BUCKET');
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL') ||
                     this.configService.get<string>('S3_ENDPOINT')?.replace(/\/$/, '') + '/' + this.bucketName;
  }

  /**
   * Upload file to R2 storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<UploadedFile> {
    const { folder = 'uploads', isPublic = true, metadata = {} } = options;

    // Generate unique file key
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    // Prepare upload parameters
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
      ACL: isPublic ? 'public-read' as const : 'private' as const,
    };

    try {
      const result = await this.s3Client.send(new PutObjectCommand(uploadParams));

      return {
        key,
        url: this.getFileUrl(key),
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        etag: result.ETag,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options: FileUploadOptions = {},
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Get presigned URL for file upload
   */
  async getUploadPresignedUrl(
    fileName: string,
    contentType: string,
    options: FileUploadOptions = {},
  ): Promise<{ url: string; key: string }> {
    const { folder = 'uploads' } = options;
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      Metadata: {
        originalName: fileName,
        uploadDate: new Date().toISOString(),
      },
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour

    return { url, key };
  }

  /**
   * Get presigned URL for file download
   */
  async getDownloadPresignedUrl(
    key: string,
    options: PresignedUrlOptions = {},
  ): Promise<string> {
    const { expiresIn = 3600, contentType } = options;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  /**
   * List files in folder
   */
  async listFiles(folder?: string, maxKeys = 1000): Promise<string[]> {
    try {
      const prefix = folder ? `${folder}/` : '';

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await this.s3Client.send(command);
      return result.Contents?.map(obj => obj.Key) || [];
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Get public URL for file
   */
  getFileUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Validate file type
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Validate file size
   */
  validateFileSize(file: Express.Multer.File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }

  /**
   * Get file info from storage
   */
  async getFileInfo(key: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
    etag: string;
  } | null> {
    try {
      const command = new GetObjectCommand({
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
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Copy file to another location
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      // Get source object
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: sourceKey,
      });

      const sourceObject = await this.s3Client.send(getCommand);

      // Upload to destination
      const putCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: destinationKey,
        Body: sourceObject.Body,
        ContentType: sourceObject.ContentType,
        Metadata: sourceObject.Metadata,
      });

      await this.s3Client.send(putCommand);
    } catch (error) {
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }
}