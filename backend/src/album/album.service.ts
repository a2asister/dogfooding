import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Album[]> {
    return this.albumRepository.find({ relations: ['photos'] });
  }

  async findOne(id: number): Promise<Album> {
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return album;
  }

  async create(albumData: { name: string; cover?: string }): Promise<Album> {
    const album = this.albumRepository.create(albumData);
    return this.albumRepository.save(album);
  }

  async update(id: number, albumData: { name?: string; cover?: string }): Promise<Album> {
    await this.albumRepository.update(id, albumData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.photoRepository.delete({ albumId: id });
    await this.albumRepository.delete(id);
  }

  async addPhoto(albumId: number, photoData: { url: string; title: string; depth?: number }): Promise<Photo> {
    const album = await this.findOne(albumId);
    const photo = this.photoRepository.create({
      ...photoData,
      albumId,
      depth: photoData.depth || 1,
    });
    const savedPhoto = await this.photoRepository.save(photo);
    
    if (!album.cover) {
      await this.albumRepository.update(albumId, { cover: savedPhoto.url });
    }
    
    return savedPhoto;
  }

  async batchAddPhotos(albumId: number, photosData: Array<{ url: string; title: string; depth?: number }>): Promise<Photo[]> {
    const album = await this.findOne(albumId);
    const photos = photosData.map((photo, index) =>
      this.photoRepository.create({
        ...photo,
        albumId,
        depth: photo.depth || ((index % 3) + 1),
      }),
    );
    const savedPhotos = await this.photoRepository.save(photos);
    
    if (!album.cover && savedPhotos.length > 0) {
      await this.albumRepository.update(albumId, { cover: savedPhotos[0]?.url });
    }
    
    return savedPhotos;
  }
}
