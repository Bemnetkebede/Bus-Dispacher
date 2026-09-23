import  { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js';
import { UserController } from './user.controller.js';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}