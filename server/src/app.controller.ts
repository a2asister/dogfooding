import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SavedWork } from './entities/saved-work.entity';
import { Template } from './entities/template.entity';
import { CreationRecord } from './entities/creation-record.entity';
import type { FissionConfig } from './types/geometric';

interface SaveWorkDto {
  name: string;
  config: FissionConfig;
  thumbnail: string;
}

interface SaveTemplateDto {
  name: string;
  config: FissionConfig;
  thumbnail: string;
  category: string;
}

interface AddRecordDto {
  workId: number;
  action: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('works')
  getWorks(): Promise<SavedWork[]> {
    return this.appService.getWorks();
  }

  @Post('works')
  saveWork(@Body() dto: SaveWorkDto): Promise<SavedWork> {
    return this.appService.saveWork(dto.name, dto.config, dto.thumbnail);
  }

  @Delete('works/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWork(@Param('id') id: string): Promise<void> {
    return this.appService.deleteWork(Number(id));
  }

  @Get('templates')
  getTemplates(): Promise<Template[]> {
    return this.appService.getTemplates();
  }

  @Post('templates')
  saveTemplate(@Body() dto: SaveTemplateDto): Promise<Template> {
    return this.appService.saveTemplate(dto.name, dto.config, dto.thumbnail, dto.category);
  }

  @Get('records')
  getCreationRecords(): Promise<CreationRecord[]> {
    return this.appService.getCreationRecords();
  }

  @Post('records')
  addCreationRecord(@Body() dto: AddRecordDto): Promise<CreationRecord> {
    return this.appService.addCreationRecord(dto.workId, dto.action);
  }
}
