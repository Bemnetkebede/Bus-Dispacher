import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { CreateRouteDto } from './Dto/Create-Route.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Patch } from '@nestjs/common';
import { UpdateRouteDto } from './Dto/Update-Route.js';

@Controller('routes') 
export class RouteController {
  constructor(private readonly routeService: RouteService) {}
  
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routeService.create(createRouteDto);
  }
  
  
  @Get()
  findAll() {
    return this.routeService.findAll();
  }


  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) 
  @Patch(':id') 
  updateRoutePrice(@Param('id') id: string, @Body() updateData: UpdateRouteDto) {
    return this.routeService.update(id, updateData);
  }
}
