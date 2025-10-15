import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PilgrimDocumentsService, DocumentUploadDto, DocumentVerificationDto } from './pilgrim-documents.service';
import { TenantId } from '../decorators/tenant-id.decorator';

@ApiTags('pilgrim-documents')
@Controller('pilgrim-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PilgrimDocumentsController {
  private readonly logger = new Logger(PilgrimDocumentsController.name);

  constructor(private readonly pilgrimDocumentsService: PilgrimDocumentsService) {}

  @Post('upload')
  @Roles('OWNER', 'ADMIN', 'OPERATION', 'SALES')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload document for pilgrim' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      pilgrim_id: string;
      document_type: string;
    },
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const uploadDto: DocumentUploadDto = {
        pilgrim_id: body.pilgrim_id,
        document_type: body.document_type,
        file: file.buffer,
        filename: file.originalname,
        mime_type: file.mimetype,
        uploaded_by: req.user.id,
      };

      const result = await this.pilgrimDocumentsService.uploadDocument(uploadDto, tenantId);

      return {
        success: true,
        message: 'Document uploaded successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to upload document: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Verify document' })
  @ApiResponse({ status: 200, description: 'Document verified successfully' })
  async verifyDocument(
    @Body() verificationDto: DocumentVerificationDto,
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const result = await this.pilgrimDocumentsService.verifyDocument(
        {
          ...verificationDto,
          verified_by: req.user.id,
        },
        tenantId,
      );

      return {
        success: true,
        message: 'Document verification updated successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to verify document: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pilgrim/:pilgrimId')
  @Roles('OWNER', 'ADMIN', 'OPERATION', 'SALES', 'FINANCE', 'VIEWER')
  @ApiOperation({ summary: 'Get all documents for a pilgrim' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getPilgrimDocuments(
    @Param('pilgrimId') pilgrimId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      const result = await this.pilgrimDocumentsService.getDocuments(pilgrimId, tenantId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to get pilgrim documents: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':documentId')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async deleteDocument(
    @Param('documentId') documentId: string,
    @TenantId() tenantId: string,
    @Request() req,
  ) {
    try {
      const result = await this.pilgrimDocumentsService.deleteDocument(
        documentId,
        tenantId,
        req.user.id,
      );

      return {
        success: true,
        message: 'Document deleted successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to delete document: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('stats')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Document statistics retrieved successfully' })
  async getDocumentStats(@TenantId() tenantId: string) {
    try {
      const stats = await this.pilgrimDocumentsService.getDocumentStats(tenantId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Failed to get document stats: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pending-verification')
  @Roles('OWNER', 'ADMIN', 'OPERATION')
  @ApiOperation({ summary: 'Get documents pending verification' })
  @ApiResponse({ status: 200, description: 'Pending documents retrieved successfully' })
  async getPendingVerificationDocuments(@TenantId() tenantId: string) {
    try {
      // This would need to be implemented in the service
      // For now, returning a placeholder response
      return {
        success: true,
        data: {
          pending_documents: [],
          total_pending: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get pending documents: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}