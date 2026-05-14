import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WallpaperService } from './wallpaper.service';
import { WallpaperController } from './wallpaper.controller';
import { Wallpaper } from '../entity/wallpaper.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallpaper])],
  controllers: [WallpaperController],
  providers: [WallpaperService],
})
export class WallpaperModule {}