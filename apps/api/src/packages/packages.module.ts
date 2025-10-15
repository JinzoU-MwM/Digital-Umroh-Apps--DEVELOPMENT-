import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PrismaModule } from '../database/prisma.module';
import { TenantResolverMiddleware } from '../common/middleware/tenant-resolver.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes(PackagesController);
  }
}