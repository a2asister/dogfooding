import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AlbumService } from './album.service';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';

@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  findAll(): Promise<Album[]> {
    return this.albumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Album> {
    return this.albumService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() albumData: { name: string; cover?: string }): Promise<Album> {
    return this.albumService.create(albumData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() albumData: { name?: string; cover?: string },
  ): Promise<Album> {
    return this.albumService.update(+id, albumData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.albumService.remove(+id);
  }

  @Post(':id/photos')
  @HttpCode(HttpStatus.CREATED)
  addPhoto(
    @Param('id') albumId: string,
    @Body() photoData: { url: string; title: string; depth?: number },
  ): Promise<Photo> {
    return this.albumService.addPhoto(+albumId, photoData);
  }

  @Post(':id/photos/batch')
  @HttpCode(HttpStatus.CREATED)
  batchAddPhotos(
    @Param('id') albumId: string,
    @Body() photosData: Array<{ url: string; title: string; depth?: number }>,
  ): Promise<Photo[]> {
    return this.albumService.batchAddPhotos(+albumId, photosData);
  }
}
