import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PaletteService } from './palette.service';
import { ColorPalette } from '../entity/ColorPalette';

@Controller('api/palettes')
export class PaletteController {
  constructor(private readonly paletteService: PaletteService) {}

  @Get()
  findAll(): Promise<ColorPalette[]> {
    return this.paletteService.findAll();
  }

  @Post()
  create(@Body() palette: { name: string; colors: string[] }): Promise<ColorPalette> {
    return this.paletteService.create(palette);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.paletteService.remove(Number(id));
  }
}
