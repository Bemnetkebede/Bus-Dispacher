import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsInt()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsOptional()
  model?: string;
}