import { Module } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { RouteController } from './route.controller.js';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [PrismaModule, HttpModule , AuthModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
