import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WallpaperService } from './wallpaper.service';
import { Wallpaper } from '../entity/wallpaper.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('wallpapers')
export class WallpaperController {
  constructor(private readonly wallpaperService: WallpaperService) {}

  @Get()
  findAll(): Promise<Wallpaper[]> {
    return this.wallpaperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Wallpaper | null> {
    return this.wallpaperService.findOne(+id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/wallpapers',
      filename: (_, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body('name') name: string): Promise<Wallpaper> {
    return this.wallpaperService.create({
      name: name || file.originalname,
      filePath: file.path,
    });
  }

  @Put(':id/params')
  updateParams(
    @Param('id') id: string,
    @Body() params: Record<string, any>,
  ): Promise<Wallpaper | null> {
    return this.wallpaperService.updateAdaptationParams(+id, params);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.wallpaperService.delete(+id);
  }
}