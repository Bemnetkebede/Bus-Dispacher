import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './Create-Route.js';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}