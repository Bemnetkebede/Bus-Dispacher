import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;


  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  plateNumber?: string;


  @IsString()
  @MinLength(3)
  firstName: string;
  @IsString()
  lastName: string;



}