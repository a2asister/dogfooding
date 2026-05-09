import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { AppSettings } from '../data/data.service';
import { DataService } from '../data/data.service';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  getSettings(): AppSettings {
    return this.dataService.getSettings();
  }

  @Patch()
  updateSettings(@Body() partial: Partial<AppSettings>): AppSettings {
    return this.dataService.updateSettings(partial);
  }
}
