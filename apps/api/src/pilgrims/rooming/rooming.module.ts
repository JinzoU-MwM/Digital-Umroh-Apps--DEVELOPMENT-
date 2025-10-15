import { Module } from '@nestjs/common';
import { RoomingController } from './rooming.controller';
import { RoomingService } from './rooming.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
  ],
  controllers: [RoomingController],
  providers: [RoomingService],
  exports: [RoomingService],
})
export class RoomingModule {}