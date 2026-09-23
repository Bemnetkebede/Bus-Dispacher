import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // 1. Removed the '?' to match the database schema strictly
  @IsString()
  @IsNotEmpty() 
  firstName: string;

  // 1. Removed the '?' to match the database schema strictly
  @IsString()
  @IsNotEmpty() 
  lastName: string;

  // 2. DELETED the role property completely for security!
}