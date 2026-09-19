import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../User/user.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req: any) {
    if (!req.user) {
      return { message: 'No user data received from Google' };
    }

    let userId: string;
    let userEmail: string;
    let userRole: string;

  
    const existingUser = await this.userService.findByEmail(req.user.email);

    if (existingUser) {
      // User exists, grab their details
      userId = existingUser.id;
      userEmail = existingUser.email;
      userRole = existingUser.role;
    } else {
      // User doesn't exist, create them and grab the new details
      const newUser = await this.userService.createUser({
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        password: '', // Leave password empty for Google users
      });
      
      userId = newUser.id;
      userEmail = newUser.email;
      userRole = newUser.role;
    }

    // Generate the JWT payload using the guaranteed string variables
    const payload = { sub: userId, email: userEmail, role: userRole };

    // Return the token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // ==========================================
  // 2. TRADITIONAL EMAIL & PASSWORD LOGIN
  // ==========================================
  async login(email: string, pass: string) {
    // 1. Verify user exists
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password matches the hash in the database
    const isPasswordValid = await bcrypt.compare(pass, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate the JWT payload
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 4. Return the signed token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}