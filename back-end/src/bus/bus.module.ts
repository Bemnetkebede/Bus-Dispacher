import { Module } from '@nestjs/common';
import { BusService } from './bus.service.js';
import { BusController } from './bus.controller.js';

@Module({
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule {}
