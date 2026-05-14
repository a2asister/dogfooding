import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteEntity } from '../entities/favorite.entity';

@Controller('api/favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  findAll(): Promise<FavoriteEntity[]> {
    return this.favoriteService.findAll();
  }

  @Post()
  add(@Body() body: { courseId: number }): Promise<FavoriteEntity> {
    return this.favoriteService.add(body.courseId);
  }

  @Delete(':courseId')
  remove(@Param('courseId') courseId: string): Promise<void> {
    return this.favoriteService.remove(Number(courseId));
  }
}
