import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  startLocation: string;

  @IsString()
  @IsNotEmpty()
  endLocation: string;
  cost: number;
}