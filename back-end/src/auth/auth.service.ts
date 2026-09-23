import { Injectable, Inject, UnauthorizedException, ConflictException , forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../User/user.service.js';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
// import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) 
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    
  ) {}

  async registerPassenger(registerDto: RegisterDto) {
    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword
      },
      select: { id: true, email: true, role: true, firstName: true }
    });
  }
  
  async googleLogin(req: any) {
    if (!req.user) {
      return { message: 'No user data received from Google' };
    }

    let userId: string;
    let userEmail: string;
    let userRole: string;

    const existingUser = await this.userService.findByEmail(req.user.email);

    if (existingUser) {
      userId = existingUser.id;
      userEmail = existingUser.email;
      userRole = existingUser.role;
    } else {
      // 🔒 SECURE FIX: Bypass UserService and create directly via Prisma
      const newUser = await this.prisma.user.create({
        data: {
          email: req.user.email,
          firstName: req.user.firstName || 'Unknown',
          lastName: req.user.lastName || 'Passenger',
          password: '',
        }
      });
      
      userId = newUser.id;
      userEmail = newUser.email;
      userRole = newUser.role;
    }

    const payload = { sub: userId, email: userEmail, role: userRole };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ==========================================
  // 2. TRADITIONAL EMAIL & PASSWORD LOGIN
  // ==========================================
  async login(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}