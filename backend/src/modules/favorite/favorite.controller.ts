import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { Favorite } from '../../entities/favorite.entity';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  create(@Body() body: { userId: number; productId: number }): Promise<Favorite> {
    return this.favoriteService.create(body.userId, body.productId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Favorite[]> {
    return this.favoriteService.findByUser(+userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.favoriteService.remove(+id);
  }
}
