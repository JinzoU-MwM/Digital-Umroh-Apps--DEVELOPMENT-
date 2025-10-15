import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaModule } from '../../database/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, PrismaModule, ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}