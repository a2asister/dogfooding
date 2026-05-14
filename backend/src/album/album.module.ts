import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Album, Photo])],
  providers: [AlbumService],
  controllers: [AlbumController],
})
export class AlbumModule {}
