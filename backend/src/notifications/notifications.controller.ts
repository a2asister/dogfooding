import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.findAll(
      req.user.userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.userId, dto);
  }

  @Put(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, parseInt(id));
  }

  @Put('read/all')
  @HttpCode(200)
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.delete(req.user.userId, parseInt(id));
  }

  @Delete('clear/all')
  @HttpCode(200)
  async clearAll(@Request() req: any) {
    return this.notificationsService.clearAll(req.user.userId);
  }

  @Post('batch/delete')
  @HttpCode(200)
  async batchDelete(@Request() req: any, @Body() body: { ids: number[] }) {
    return this.notificationsService.batchDelete(req.user.userId, body.ids);
  }

  @Post('repair')
  @HttpCode(200)
  async repairNotifications(@Request() req: any) {
    return this.notificationsService.repairNotifications(req.user.userId);
  }
}
