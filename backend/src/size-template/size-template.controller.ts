import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { SizeTemplateService } from './size-template.service';
import { CreateSizeTemplateDto } from './dto/create-size-template.dto';
import { SizeTemplate } from './size-template.entity';

@Controller('size-templates')
export class SizeTemplateController {
  constructor(private readonly sizeTemplateService: SizeTemplateService) {}

  @Get()
  findAll(): Promise<SizeTemplate[]> {
    return this.sizeTemplateService.findAll();
  }

  @Post()
  create(@Body() createSizeTemplateDto: CreateSizeTemplateDto): Promise<SizeTemplate> {
    return this.sizeTemplateService.create(createSizeTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.sizeTemplateService.remove(Number(id));
  }
}
