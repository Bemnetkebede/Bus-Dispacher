import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { AuthModule } from '../auth/auth.module.js'; 
import { PrismaModule } from '../../prisma/prisma.module.js'; 

@Module({
  // Wrap AuthModule with forwardRef
  imports: [PrismaModule, forwardRef(() => AuthModule)], 
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}