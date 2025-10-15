import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../database/prisma.module';
import { MailerModule } from '../shared/mailer/mailer.module';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}