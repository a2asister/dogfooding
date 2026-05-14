import { Controller, Get, Param, Query } from '@nestjs/common'
import { TemplateService } from './template.service'
import { CardTemplate } from './template.entity'

@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async findAll(@Query('category') category?: string): Promise<CardTemplate[]> {
    return this.templateService.findAll(category)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CardTemplate | null> {
    return this.templateService.findOne(Number(id))
  }
}
