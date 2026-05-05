import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body()
    createUserDto: {
      username: string;
      password: string;
      email: string;
    },
  ) {
    const user = await this.usersService.createUser(createUserDto);
    const { password, privateKey, ...safeUser } = user;
    return {
      success: true,
      data: safeUser,
    };
  }

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    const profile = await this.usersService.getUserProfile(userId);
    return {
      success: true,
      data: profile,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    const { password, privateKey, ...safeUser } = user;
    return {
      success: true,
      data: safeUser,
    };
  }

  @Put('profile')
  async updateProfile(
    @Req() req: Request,
    @Body()
    updateUserDto: Partial<{
      email: string;
      syncDirectory: string;
    }>,
  ) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    const user = await this.usersService.update(userId, updateUserDto);
    const { password, privateKey, ...safeUser } = user;
    return {
      success: true,
      data: safeUser,
    };
  }
}
