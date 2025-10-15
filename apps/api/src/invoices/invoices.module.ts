import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PrismaModule } from '../database/prisma.module';
import { TenantResolverMiddleware } from '../common/middleware/tenant-resolver.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes(InvoicesController);
  }
}