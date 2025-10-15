import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PilgrimsController } from './pilgrims.controller';
import { PilgrimsService } from './pilgrims.service';
import { PilgrimDocumentsModule } from './documents/pilgrim-documents.module';
import { RoomingModule } from './rooming/rooming.module';
import { PrismaModule } from '../database/prisma.module';
import { TenantResolverMiddleware } from '../common/middleware/tenant-resolver.middleware';

@Module({
  imports: [
    PrismaModule,
    PilgrimDocumentsModule,
    RoomingModule,
  ],
  controllers: [PilgrimsController],
  providers: [PilgrimsService],
  exports: [PilgrimsService],
})
export class PilgrimsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes(PilgrimsController);
  }
}