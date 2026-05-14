import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { DeviceConfigService } from './device-config.service';
import { DeviceConfig } from '../entity/device-config.entity';

@Controller('device-configs')
export class DeviceConfigController {
  constructor(private readonly deviceConfigService: DeviceConfigService) {}

  @Get()
  findAll(): Promise<DeviceConfig[]> {
    return this.deviceConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DeviceConfig | null> {
    return this.deviceConfigService.findOne(+id);
  }

  @Post()
  create(@Body() data: {
    deviceName: string;
    screenWidth: number;
    screenHeight: number;
    refreshRate?: number;
  }): Promise<DeviceConfig> {
    return this.deviceConfigService.create(data);
  }

  @Put(':id/effects')
  updateEffects(
    @Param('id') id: string,
    @Body() settings: Partial<DeviceConfig['effectSettings']>,
  ): Promise<DeviceConfig | null> {
    return this.deviceConfigService.updateEffectSettings(+id, settings);
  }
}