import { Module } from '@nestjs/common';
import { BusService } from './bus.service.js';
import { BusController } from './bus.controller.js';
import {AuthModule} from '../auth/auth.module.js'

@Module({
  imports : [AuthModule],
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule {}
