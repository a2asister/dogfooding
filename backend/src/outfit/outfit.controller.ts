import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { OutfitService } from './outfit.service';
import { Outfit } from '../entities/outfit.entity';

@Controller('api/outfits')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Get()
  findAll(): Promise<Outfit[]> {
    return this.outfitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Outfit | null> {
    return this.outfitService.findOne(id);
  }

  @Post()
  create(@Body() outfitData: Partial<Outfit> & { clothingIds?: string[] }): Promise<Outfit> {
    return this.outfitService.create(outfitData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() outfitData: Partial<Outfit> & { clothingIds?: string[] }): Promise<Outfit | null> {
    return this.outfitService.update(id, outfitData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.outfitService.remove(id);
  }
}
