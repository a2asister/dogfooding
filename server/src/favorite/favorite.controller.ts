import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from '../entities/favorite.entity';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    return this.favoriteService.create(createFavoriteDto);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string): Promise<Favorite[]> {
    return this.favoriteService.findAllByUser(userId);
  }

  @Get('user/:userId/element/:elementId')
  isFavorite(
    @Param('userId') userId: string,
    @Param('elementId') elementId: string,
  ): Promise<{ isFavorite: boolean }> {
    return this.favoriteService.isFavorite(userId, +elementId);
  }

  @Delete('user/:userId/element/:elementId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('userId') userId: string,
    @Param('elementId') elementId: string,
  ): Promise<void> {
    return this.favoriteService.remove(userId, +elementId);
  }
}
