import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentLinksController } from './payment-links.controller';
import { WebhooksController } from './webhooks/webhooks.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TenantResolverMiddleware } from '../common/middleware/tenant-resolver.middleware';
import { XenditService } from './gateways/xendit.service';
import { MidtransService } from './gateways/midtrans.service';
import { PaymentGatewayService } from './gateways/payment-gateway.service';
import { WebhookHandlerService } from './webhooks/webhook-handler.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [
    PaymentsController,
    PaymentLinksController,
    WebhooksController,
  ],
  providers: [
    PaymentsService,
    XenditService,
    MidtransService,
    PaymentGatewayService,
    WebhookHandlerService,
  ],
  exports: [
    PaymentsService,
    PaymentGatewayService,
    XenditService,
    MidtransService,
    WebhookHandlerService,
  ],
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes(PaymentsController, PaymentLinksController);
    // Note: WebhooksController doesn't need tenant middleware since webhooks should work cross-tenant
  }
}