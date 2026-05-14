import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { Preference } from '../entities/preference.entity';

@Controller('api/preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  find(): Promise<Preference> {
    return this.preferenceService.find();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() preference: Partial<Preference>): Promise<Preference | null> {
    return this.preferenceService.update(id, preference);
  }
}
