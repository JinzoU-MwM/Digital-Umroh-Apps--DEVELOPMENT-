import { Module } from '@nestjs/common';
import { PilgrimDocumentsController } from './pilgrim-documents.controller';
import { PilgrimDocumentsService } from './pilgrim-documents.service';
import { CloudflareR2Module } from '../cloudflare-r2/cloudflare-r2.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    CloudflareR2Module,
    NotificationsModule,
  ],
  controllers: [PilgrimDocumentsController],
  providers: [PilgrimDocumentsService],
  exports: [PilgrimDocumentsService],
})
export class PilgrimDocumentsModule {}