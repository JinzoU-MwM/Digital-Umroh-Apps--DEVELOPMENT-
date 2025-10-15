import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CloudflareR2Service } from '../cloudflare-r2/cloudflare-r2.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface DocumentUploadDto {
  pilgrim_id: string;
  document_type: string;
  file: Buffer;
  filename: string;
  mime_type: string;
  uploaded_by: string;
}

export interface DocumentVerificationDto {
  document_id: string;
  status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION';
  notes?: string;
  verified_by: string;
}

export interface PilgrimDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  uploaded_at: Date;
  verified_at?: Date;
  verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION';
  verification_notes?: string;
  verified_by?: string;
  file_size: number;
  mime_type: string;
}

@Injectable()
export class PilgrimDocumentsService {
  private readonly logger = new Logger(PilgrimDocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareR2Service: CloudflareR2Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  async uploadDocument(uploadDto: DocumentUploadDto, tenantId: string) {
    const { pilgrim_id, document_type, file, filename, mime_type, uploaded_by } = uploadDto;

    // Validate pilgrim exists and belongs to tenant
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrim_id,
        deleted_at: null,
      },
      include: {
        customer: true,
        booking: true,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    // Generate unique file path
    const fileKey = `tenants/${tenantId}/pilgrims/${pilgrim_id}/documents/${Date.now()}-${filename}`;

    // Upload to Cloudflare R2
    const uploadResult = await this.cloudflareR2Service.uploadFile(fileKey, file, mime_type);

    if (!uploadResult.success) {
      throw new BadRequestException('Failed to upload document');
    }

    // Create document record
    const newDocument: PilgrimDocument = {
      id: this.generateId(),
      type: document_type,
      name: filename,
      url: uploadResult.url,
      uploaded_at: new Date(),
      verification_status: 'PENDING',
      file_size: file.length,
      mime_type,
    };

    // Update pilgrim's documents array
    const currentDocuments = (pilgrim.documents as PilgrimDocument[]) || [];
    currentDocuments.push(newDocument);

    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: pilgrim_id },
      data: {
        documents: currentDocuments as any,
        document_completion: this.calculateDocumentCompletion(currentDocuments),
      },
    });

    // Send notification to operations team
    await this.notificationsService.sendNotification({
      tenant_id: tenantId,
      recipient_id: null, // Will be sent to operations team
      type: 'DOCUMENT_UPLOADED',
      channel: 'EMAIL',
      title: 'New Document Uploaded',
      content: `New document "${filename}" has been uploaded for pilgrim ${pilgrim.name}`,
      template_data: {
        pilgrim_name: pilgrim.name,
        document_type: document_type,
        document_name: filename,
        uploaded_by: uploaded_by,
        customer_name: pilgrim.customer?.name,
      },
    });

    this.logger.log(`Document uploaded successfully for pilgrim ${pilgrim_id}: ${filename}`);

    return {
      document: newDocument,
      pilgrim: updatedPilgrim,
    };
  }

  async verifyDocument(verificationDto: DocumentVerificationDto, tenantId: string) {
    const { document_id, status, notes, verified_by } = verificationDto;

    // Find pilgrim with this document
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        deleted_at: null,
      },
    });

    let targetPilgrim = null;
    let targetDocument = null;
    let documentIndex = -1;

    for (const pilgrim of pilgrims) {
      const documents = (pilgrim.documents as PilgrimDocument[]) || [];
      const docIndex = documents.findIndex(doc => doc.id === document_id);

      if (docIndex !== -1) {
        targetPilgrim = pilgrim;
        targetDocument = documents[docIndex];
        documentIndex = docIndex;
        break;
      }
    }

    if (!targetPilgrim || !targetDocument) {
      throw new NotFoundException('Document not found');
    }

    // Update document verification status
    const documents = (targetPilgrim.documents as PilgrimDocument[]);
    documents[documentIndex] = {
      ...targetDocument,
      verification_status: status,
      verification_notes: notes,
      verified_by,
      verified_at: new Date(),
    };

    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: targetPilgrim.id },
      data: {
        documents: documents as any,
        document_completion: this.calculateDocumentCompletion(documents),
      },
    });

    // Send notification based on verification status
    if (status === 'VERIFIED') {
      await this.notificationsService.sendNotification({
        tenant_id: tenantId,
        recipient_id: null, // Will be sent to pilgrim/customer
        type: 'DOCUMENT_VERIFIED',
        channel: 'WHATSAPP',
        title: 'Document Verified',
        content: `Your document "${targetDocument.name}" has been verified successfully`,
        template_data: {
          pilgrim_name: targetPilgrim.name,
          document_name: targetDocument.name,
          document_type: targetDocument.type,
        },
      });
    } else if (status === 'REJECTED' || status === 'NEEDS_REVISION') {
      await this.notificationsService.sendNotification({
        tenant_id: tenantId,
        recipient_id: null,
        type: 'DOCUMENT_REJECTED',
        channel: 'WHATSAPP',
        title: 'Document Needs Attention',
        content: `Your document "${targetDocument.name}" ${status === 'REJECTED' ? 'has been rejected' : 'needs revision'}. ${notes || 'Please contact support for details.'}`,
        template_data: {
          pilgrim_name: targetPilgrim.name,
          document_name: targetDocument.name,
          document_type: targetDocument.type,
          notes: notes || '',
          action_required: status === 'REJECTED' ? 'REUPLOAD' : 'REVISE',
        },
      });
    }

    this.logger.log(`Document ${document_id} verified with status: ${status}`);

    return {
      document: documents[documentIndex],
      pilgrim: updatedPilgrim,
    };
  }

  async getDocuments(pilgrimId: string, tenantId: string) {
    const pilgrim = await this.prisma.pilgrim.findFirst({
      where: {
        id: pilgrimId,
        deleted_at: null,
      },
    });

    if (!pilgrim) {
      throw new NotFoundException('Pilgrim not found');
    }

    const documents = (pilgrim.documents as PilgrimDocument[]) || [];

    return {
      pilgrim_id: pilgrimId,
      documents,
      completion_percentage: pilgrim.document_completion,
    };
  }

  async deleteDocument(documentId: string, tenantId: string, deletedBy: string) {
    // Find pilgrim with this document
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        deleted_at: null,
      },
    });

    let targetPilgrim = null;
    let documentIndex = -1;
    let targetDocument = null;

    for (const pilgrim of pilgrims) {
      const documents = (pilgrim.documents as PilgrimDocument[]) || [];
      const docIndex = documents.findIndex(doc => doc.id === documentId);

      if (docIndex !== -1) {
        targetPilgrim = pilgrim;
        targetDocument = documents[docIndex];
        documentIndex = docIndex;
        break;
      }
    }

    if (!targetPilgrim || !targetDocument) {
      throw new NotFoundException('Document not found');
    }

    // Delete from Cloudflare R2
    const fileKey = this.extractFileKeyFromUrl(targetDocument.url);
    if (fileKey) {
      await this.cloudflareR2Service.deleteFile(fileKey);
    }

    // Remove from pilgrim's documents array
    const documents = (targetPilgrim.documents as PilgrimDocument[]);
    documents.splice(documentIndex, 1);

    const updatedPilgrim = await this.prisma.pilgrim.update({
      where: { id: targetPilgrim.id },
      data: {
        documents: documents as any,
        document_completion: this.calculateDocumentCompletion(documents),
      },
    });

    this.logger.log(`Document ${documentId} deleted from pilgrim ${targetPilgrim.id}`);

    return {
      pilgrim: updatedPilgrim,
      deleted_document: targetDocument,
    };
  }

  async getDocumentStats(tenantId: string) {
    const pilgrims = await this.prisma.pilgrim.findMany({
      where: {
        deleted_at: null,
      },
    });

    let totalDocuments = 0;
    let verifiedDocuments = 0;
    let pendingDocuments = 0;
    let rejectedDocuments = 0;

    const requiredDocuments = [
      'PASSPORT_COPY',
      'ID_CARD',
      'BIRTH_CERTIFICATE',
      'MARRIAGE_CERTIFICATE',
      'PHOTO_4X6',
      'VACCINATION_CERTIFICATE',
    ];

    const documentStats = {};

    pilgrims.forEach((pilgrim) => {
      const documents = (pilgrim.documents as PilgrimDocument[]) || [];

      documents.forEach((doc) => {
        totalDocuments++;

        if (doc.verification_status === 'VERIFIED') {
          verifiedDocuments++;
        } else if (doc.verification_status === 'PENDING') {
          pendingDocuments++;
        } else if (doc.verification_status === 'REJECTED' || doc.verification_status === 'NEEDS_REVISION') {
          rejectedDocuments++;
        }

        // Track by document type
        if (!documentStats[doc.type]) {
          documentStats[doc.type] = { total: 0, verified: 0, pending: 0, rejected: 0 };
        }

        documentStats[doc.type].total++;

        if (doc.verification_status === 'VERIFIED') {
          documentStats[doc.type].verified++;
        } else if (doc.verification_status === 'PENDING') {
          documentStats[doc.type].pending++;
        } else if (doc.verification_status === 'REJECTED' || doc.verification_status === 'NEEDS_REVISION') {
          documentStats[doc.type].rejected++;
        }
      });
    });

    return {
      overview: {
        total_pilgrims: pilgrims.length,
        total_documents: totalDocuments,
        verified_documents: verifiedDocuments,
        pending_documents: pendingDocuments,
        rejected_documents: rejectedDocuments,
        verification_rate: totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0,
      },
      by_type: documentStats,
      required_documents: requiredDocuments.map(docType => ({
        type: docType,
        stats: documentStats[docType] || { total: 0, verified: 0, pending: 0, rejected: 0 },
      })),
    };
  }

  private calculateDocumentCompletion(documents: PilgrimDocument[]): number {
    if (documents.length === 0) return 0;

    const verifiedCount = documents.filter(doc => doc.verification_status === 'VERIFIED').length;
    return Math.round((verifiedCount / documents.length) * 100);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private extractFileKeyFromUrl(url: string): string | null {
    // Extract the file key from the Cloudflare R2 URL
    // This depends on your URL structure
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
      return null;
    }
  }
}