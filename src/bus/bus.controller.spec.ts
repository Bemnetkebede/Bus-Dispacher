import { Test, TestingModule } from '@nestjs/testing';
import { BusController } from './bus.controller.js';
import { BusService } from './bus.service.js';

describe('BusController', () => {
  let controller: BusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusController],
      providers: [BusService],
    }).compile();

    controller = module.get<BusController>(BusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
