import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { UserPreference } from '../entity/user-preference.entity';

@Controller('user-preferences')
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Get(':userId')
  findByUserId(@Param('userId') userId: string): Promise<UserPreference | null> {
    return this.userPreferenceService.findByUserId(userId);
  }

  @Post()
  createOrUpdate(@Body() data: {
    userId: string;
    wallpaperParams: Record<string, any>;
    customEffects?: Record<string, any>;
    lastWallpaperId?: number;
  }): Promise<UserPreference> {
    return this.userPreferenceService.createOrUpdate(data.userId, data);
  }
}