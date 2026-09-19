import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { CreateRouteDto } from './Dto/Create-Route.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
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
  
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get()
  findAll() {
    return this.routeService.findAll();
  }


  @Roles(Role.ADMIN, Role.DISPATCHER)
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
