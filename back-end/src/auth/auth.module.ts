import { Module , forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../User/user.module.js'
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';


@Module({
  imports: [
    forwardRef(() => UserModule), // Keep this one
    // REMOVED: UserModule (Do not import it directly)
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  providers: [AuthService, JwtStrategy , GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}