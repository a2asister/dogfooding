import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallpaper } from '../entity/wallpaper.entity';

@Injectable()
export class WallpaperService {
  constructor(
    @InjectRepository(Wallpaper)
    private wallpaperRepository: Repository<Wallpaper>,
  ) {}

  async findAll(): Promise<Wallpaper[]> {
    return this.wallpaperRepository.find();
  }

  async findOne(id: number): Promise<Wallpaper | null> {
    return this.wallpaperRepository.findOneBy({ id });
  }

  async create(data: {
    name: string;
    filePath: string;
    originalWidth?: number;
    originalHeight?: number;
  }): Promise<Wallpaper> {
    const wallpaper = this.wallpaperRepository.create(data);
    return this.wallpaperRepository.save(wallpaper);
  }

  async updateAdaptationParams(id: number, params: Record<string, any>): Promise<Wallpaper | null> {
    await this.wallpaperRepository.update(id, { adaptationParams: params });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.wallpaperRepository.delete(id);
  }
}