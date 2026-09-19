import { Module } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { RouteController } from './route.controller.js';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
