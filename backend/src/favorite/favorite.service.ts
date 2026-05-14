import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteEntity } from '../entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private favoriteRepository: Repository<FavoriteEntity>,
  ) {}

  async findAll(): Promise<FavoriteEntity[]> {
    return this.favoriteRepository.find();
  }

  async add(courseId: number): Promise<FavoriteEntity> {
    const existing = await this.favoriteRepository.findOneBy({ courseId });
    if (existing) {
      return existing;
    }
    const favorite = this.favoriteRepository.create({ courseId });
    return this.favoriteRepository.save(favorite);
  }

  async remove(courseId: number): Promise<void> {
    await this.favoriteRepository.delete({ courseId });
  }
}
