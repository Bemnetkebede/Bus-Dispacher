import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'; 
import { CreateBusDto } from './DTO/create-bus.dto.js'; 

@Injectable()
export class BusService {
  // 1. Injected PrismaService via the constructor
  constructor(private readonly prismaService: PrismaService) {}

  async createBus(createBusDto: CreateBusDto) {
    const existingBus = await this.prismaService.bus.findUnique({
      where: {
        plateNumber: createBusDto.plateNumber,
      },
    });

    if (existingBus) {
      throw new ConflictException('A bus with this plate number already exists');
    }

    return this.prismaService.bus.create({
      data: { // 2. Fixed typo: changed 'date' to 'data'
        ...createBusDto,
      },
    });
  } // 3. Added the missing closing brace for the create method

  async findAll() {
    return this.prismaService.bus.findMany();
  }

  async findOne(id: string) {
    const bus = await this.prismaService.bus.findUnique({
      where: { id },
    });

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }

  async update(id: string, createBusDto: CreateBusDto) { // Swapped parameter order for standard NestJS conventions
    return this.prismaService.bus.update({
      where: { id },
      data: {
        ...createBusDto,
      },
    });
  }
}