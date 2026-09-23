import { ConflictException, Injectable, NotFoundException , Controller, Post , Body, Get , Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'; 
import { CreateBusDto } from './DTO/create-bus.dto.js'; 
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator.js';


@Injectable()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bus')
export class BusController {
  // 1. Injected PrismaService via the constructor
  constructor(private readonly prismaService: PrismaService) {}
  @Roles(Role.ADMIN)
  @Post()
  async createBus(@Body() createBusDto: CreateBusDto) {
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
  
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get()
  async findAll() {
    return this.prismaService.bus.findMany();
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get(':id')
  async findOne(id: string) {
    const bus = await this.prismaService.bus.findUnique({
      where: { id },
    });

    if (!bus) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }
    return bus;
  }
    
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(id: string, createBusDto: CreateBusDto) { // Swapped parameter order for standard NestJS conventions
    return this.prismaService.bus.update({
      where: { id },
      data: {
        ...createBusDto,
      },
    });
  }
}