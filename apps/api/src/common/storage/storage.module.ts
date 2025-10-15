import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { R2StorageService } from './r2-storage.service';
import { FileUploadController } from './file-upload.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MulterModule.register({
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB max file size
      },
    }),
  ],
  providers: [R2StorageService],
  controllers: [FileUploadController],
  exports: [R2StorageService],
})
export class StorageModule {}