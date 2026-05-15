import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LayoutService } from '../services/layout.service';

@Controller('api/layouts')
export class LayoutController {
  constructor(private readonly layoutService: LayoutService) {}

  @Get()
  findAll() {
    return this.layoutService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.layoutService.findOne(name);
  }

  @Post(':name')
  save(@Param('name') name: string, @Body() config: any) {
    return this.layoutService.save(name, config);
  }
}
