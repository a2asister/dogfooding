import { Controller, Get, UseGuards, Request, Put, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getCurrentUser(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  async updateCurrentUser(@Request() req, @Body() updateData: any) {
    const { password, ...safeUpdateData } = updateData;
    return this.usersService.update(req.user.userId, safeUpdateData);
  }
}
