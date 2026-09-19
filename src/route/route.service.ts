import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRouteDto } from './Dto/Create-Route.js';

@Injectable()
export class RouteService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}


  private formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  private mapRouteResponse(route: any) {
    return {
      ...route,
      formattedDuration: this.formatTime(route.estimatedDurationMins),
    };
  }

  private async getCoordinates(address: string): Promise<{ lat: string; lon: string }> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    
    const response = await lastValueFrom(
      this.httpService.get(url, {
        headers: { 
          'User-Agent': 'BusDispatcherSystem-AddisAbaba/1.0',
          'Accept': 'application/json',
        },
      }),
    );

    if (!response.data || response.data.length === 0) {
      throw new NotFoundException(`Location not found on map: "${address}"`);
    }

    return {
      lat: response.data[0].lat,
      lon: response.data[0].lon,
    };
  }


  async create(createRouteDto: CreateRouteDto) {
    try {
      const startCoords = await this.getCoordinates(createRouteDto.startLocation);
      const endCoords = await this.getCoordinates(createRouteDto.endLocation);

      
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lon},${startCoords.lat};${endCoords.lon},${endCoords.lat}?overview=false`;
      
      const routeResponse = await lastValueFrom(this.httpService.get(osrmUrl));
      const routeData = routeResponse.data?.routes?.[0];
      
      if (!routeData) {
        throw new Error('Unable to compute a driving route between specified points.');
      }

      const distanceInKm = Number((routeData.distance / 1000).toFixed(2));
      const durationInMinutes = Math.round(routeData.duration / 60);

      
      const savedRoute = await this.prismaService.route.create({
        data: {
          startLocation: createRouteDto.startLocation,
          endLocation: createRouteDto.endLocation,
          distanceKm: distanceInKm,
          estimatedDurationMins: durationInMinutes,
          cost : createRouteDto.cost, 
        },
      });
      
     
      return this.mapRouteResponse(savedRoute);

    } catch (error) {
      console.error('[ERROR in RouteService]:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Route calculation failed';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findAll() {
    const routes = await this.prismaService.route.findMany();
    return routes.map(route => this.mapRouteResponse(route));
  }

  async findOne(id: string) {
    const route = await this.prismaService.route.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    return this.mapRouteResponse(route);
  }

  async update(id: string, updateData: any) {
    return this.prismaService.route.update({
      where: { id },
      data: updateData,
    });
  }
}