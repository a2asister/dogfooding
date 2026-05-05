import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Req() req: Request,
  ) {
    const user = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );
    (req.session as any).userId = user.id;
    return {
      success: true,
      data: user,
    };
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    await this.authService.logout(req.session);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  async getCurrentUser(@Req() req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    const profile = await this.usersService.getUserProfile(userId);
    return {
      success: true,
      data: profile,
    };
  }

  @Get('check')
  async checkAuth(@Req() req: Request) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return {
        success: true,
        data: { authenticated: false },
      };
    }
    return {
      success: true,
      data: { authenticated: true, userId },
    };
  }
}
