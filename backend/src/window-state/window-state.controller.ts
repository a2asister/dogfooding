import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WindowStateService } from './window-state.service';
import { CreateWindowStateDto, UpdateWindowStateDto } from './dto/window-state.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('windows')
@UseGuards(JwtAuthGuard)
export class WindowStateController {
  constructor(private readonly windowStateService: WindowStateService) {}

  @Get()
  async getAllWindows(@Request() req: any) {
    return this.windowStateService.getAllWindows(req.user.userId);
  }

  @Get(':windowId')
  async getWindow(@Request() req: any, @Param('windowId') windowId: string) {
    return this.windowStateService.getWindowByWindowId(req.user.userId, windowId);
  }

  @Post()
  async createWindow(@Request() req: any, @Body() createDto: CreateWindowStateDto) {
    return this.windowStateService.createWindow(req.user.userId, createDto);
  }

  @Put(':windowId')
  async updateWindow(
    @Request() req: any,
    @Param('windowId') windowId: string,
    @Body() updateDto: UpdateWindowStateDto,
  ) {
    return this.windowStateService.updateWindow(req.user.userId, windowId, updateDto);
  }

  @Delete(':windowId')
  async closeWindow(@Request() req: any, @Param('windowId') windowId: string) {
    return this.windowStateService.closeWindow(req.user.userId, windowId);
  }

  @Delete()
  async closeAllWindows(@Request() req: any) {
    return this.windowStateService.closeAllWindows(req.user.userId);
  }

  @Put(':windowId/front')
  async bringToFront(@Request() req: any, @Param('windowId') windowId: string) {
    return this.windowStateService.bringToFront(req.user.userId, windowId);
  }

  @Put(':windowId/minimize')
  async minimizeWindow(@Request() req: any, @Param('windowId') windowId: string) {
    return this.windowStateService.minimizeWindow(req.user.userId, windowId);
  }

  @Put(':windowId/maximize')
  async maximizeWindow(@Request() req: any, @Param('windowId') windowId: string) {
    return this.windowStateService.maximizeWindow(req.user.userId, windowId);
  }
}
