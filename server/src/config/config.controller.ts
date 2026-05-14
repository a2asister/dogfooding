import { Controller, Get, Post, Delete, Put, Body, Param, Query } from '@nestjs/common'
import { ConfigService } from './config.service'

@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  create(@Body() data: { name: string; category: string; config: any }) {
    return this.configService.create(data)
  }

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.configService.findByCategory(category)
    }
    return this.configService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(+id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configService.delete(+id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { name: string; category: string; config: any }) {
    return this.configService.update(+id, data)
  }

  @Get('categories/list')
  getCategories() {
    return this.configService.getCategories()
  }
}
