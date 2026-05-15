import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DesktopService } from './desktop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('desktop')
@UseGuards(JwtAuthGuard)
export class DesktopController {
  constructor(private readonly desktopService: DesktopService) {}

  @Get('init')
  async getDesktopInitData(@Request() req: any) {
    return this.desktopService.getDesktopConfig(req.user.userId);
  }

  @Post('layout')
  async saveLayout(
    @Request() req: any,
    @Body() body: { layout: Array<{ id: string; name: string; icon: string; x: number; y: number; type: 'folder' | 'file' | 'app' }> },
  ) {
    return this.desktopService.saveLayout(req.user.userId, body.layout);
  }

  @Get('icons')
  getDefaultIcons() {
    return this.desktopService.getDefaultIcons();
  }
}