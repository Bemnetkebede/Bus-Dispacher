import  { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserController } from './user.controller.js';

@Module({
    controllers : [UserController , AuthModule],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}