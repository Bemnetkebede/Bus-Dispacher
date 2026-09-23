import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // 0. Traditional Email/Password Signup
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    return this.authService.registerPassenger(RegisterDto)
  }

  // 1. Traditional Email/Password Login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
  

  // 2. Google OAuth Login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
  }


  // 3. Google OAuth Callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req);
  }
}
