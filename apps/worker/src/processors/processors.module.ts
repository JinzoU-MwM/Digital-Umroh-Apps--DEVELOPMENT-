import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { EmailProcessor } from './email.processor';
import { ReportProcessor } from './report.processor';
import { PaymentProcessor } from './payment.processor';
import { DocumentProcessor } from './document.processor';
import { RoomingProcessor } from './rooming.processor';

@Module({
  providers: [
    NotificationProcessor,
    EmailProcessor,
    ReportProcessor,
    PaymentProcessor,
    DocumentProcessor,
    RoomingProcessor,
  ],
  exports: [
    NotificationProcessor,
    EmailProcessor,
    ReportProcessor,
    PaymentProcessor,
    DocumentProcessor,
    RoomingProcessor,
  ],
})
export class ProcessorsModule {}