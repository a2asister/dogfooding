import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ClothingService } from './clothing.service';
import { Clothing } from '../entities/clothing.entity';

@Controller('api/clothing')
export class ClothingController {
  constructor(private readonly clothingService: ClothingService) {}

  @Get()
  findAll(): Promise<Clothing[]> {
    return this.clothingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Clothing | null> {
    return this.clothingService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `clothing-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<Clothing> {
    const clothingData = {
      name: body.name,
      category: body.category,
      colors: body.colors ? JSON.parse(body.colors) : [],
      description: body.description || '',
      imagePath: file ? `/uploads/${file.filename}` : '',
    };
    return this.clothingService.create(clothingData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() clothing: Partial<Clothing>): Promise<Clothing | null> {
    return this.clothingService.update(id, clothing);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clothingService.remove(id);
  }
}
