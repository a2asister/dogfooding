import { Controller, Get, Post, Put, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { DesktopService } from './desktop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThemeConfig, DisplayConfig, DateTimeConfig, PersonalizationConfig } from '../entities/desktop-config.entity';

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

  @Put('theme')
  async saveTheme(@Request() req: any, @Body() theme: ThemeConfig) {
    return this.desktopService.saveTheme(req.user.userId, theme);
  }

  @Put('wallpaper')
  async saveWallpaper(@Request() req: any, @Body() body: { wallpaper: string }) {
    return this.desktopService.saveWallpaper(req.user.userId, body.wallpaper);
  }

  @Put('taskbar')
  async saveTaskbarConfig(@Request() req: any, @Body() taskbarConfig: any) {
    return this.desktopService.saveTaskbarConfig(req.user.userId, taskbarConfig);
  }

  @Put('display')
  async saveDisplayConfig(@Request() req: any, @Body() display: DisplayConfig) {
    return this.desktopService.saveDisplayConfig(req.user.userId, display);
  }

  @Put('datetime')
  async saveDateTimeConfig(@Request() req: any, @Body() dateTime: DateTimeConfig) {
    return this.desktopService.saveDateTimeConfig(req.user.userId, dateTime);
  }

  @Put('personalization')
  async savePersonalizationConfig(@Request() req: any, @Body() personalization: PersonalizationConfig) {
    return this.desktopService.savePersonalizationConfig(req.user.userId, personalization);
  }

  @Post('repair')
  @HttpCode(200)
  async repairConfig(@Request() req: any) {
    return this.desktopService.repairConfig(req.user.userId);
  }

  @Get('icons')
  getDefaultIcons() {
    return this.desktopService.getDefaultIcons();
  }
}