import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserCreateSchema, UserUpdateProps, UserUpdateSchema } from '../interface/user_interface';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async createUser(@Body() data: unknown): Promise<User> {
    const parsedData = UserCreateSchema.safeParse(data);

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    return this.userService.createUser(parsedData.data);
  }

  @Get()
  async findUserByEmail(@Query('email') email: string): Promise<User[] | User | null> {
    if (email) {
      return this.userService.findUserByEmail(email);
    } else {
      return this.userService.findAllUsers();
    }
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<User | null> {
    return this.userService.findUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: unknown,
  ): Promise<User> {
    const parsedData = UserUpdateSchema.safeParse(data);

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.errors);
    }

    const updateData: UserUpdateProps = { id, ...parsedData.data };
    return this.userService.updateUser(updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser(id);
  }
}
