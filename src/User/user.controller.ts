import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './Dto/create-users.dto.js';
import { UpdateUserDto } from './Dto/update-user.dto.js'
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService){}
 
    @Roles(Role.ADMIN, Role.DISPATCHER)
    @Post()
    async CreateUser(@Body() createUserDto: CreateUserDto){
        return this.userService.createUser(createUserDto)
    }

    @Roles(Role.ADMIN, Role.DISPATCHER)
    @Get()
    async findALL(){
        return this.userService.findAll()
    }

     @Roles(Role.ADMIN, Role.DISPATCHER)
     @Get(":id")
    async findone(@Param('id') id:string){
        return this.userService.findOne(id)
    }
    
    @Roles(Role.ADMIN, Role.DISPATCHER)
    @Patch(":id")
    async update(@Param('id') id:string, @Body() updateUserDto: UpdateUserDto){
        return this.userService.update(id, updateUserDto)
    }


    @Roles(Role.ADMIN)
    @Delete(":id")
    async remove(@Param('id') id:string ){
        return this.userService.remove(id)
    }
}