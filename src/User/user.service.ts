import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './Dto/create-users.dto.js';
import { UpdateUserDto } from './Dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    if(!this.prismaService.user){
      throw new NotFoundException('there is no user in the database');
    }
    return this.prismaService.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('User not found with this id');
    }
    return user;
  }


  // Add this inside src/user/user.service.ts
  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const dataToUpdate: Record<string, unknown> = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prismaService.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, email: true, role: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.user.delete({ where: { id } });
  }
}
