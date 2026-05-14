import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { FavoriteEntity } from '../entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity])],
  providers: [FavoriteService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}
