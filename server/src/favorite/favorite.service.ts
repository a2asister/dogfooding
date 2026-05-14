import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOne({
      where: {
        userId: createFavoriteDto.userId,
        elementId: createFavoriteDto.elementId,
      },
      relations: ['element'],
    });
    
    if (existing) {
      return existing;
    }
    
    const favorite = this.favoriteRepository.create(createFavoriteDto);
    const saved = await this.favoriteRepository.save(favorite);
    return this.favoriteRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['element'],
    });
  }

  async findAllByUser(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['element'],
    });
  }

  async remove(userId: string, elementId: number): Promise<void> {
    const result = await this.favoriteRepository.delete({ userId, elementId });
    if (result.affected === 0) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async isFavorite(userId: string, elementId: number): Promise<{ isFavorite: boolean }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, elementId },
    });
    return { isFavorite: !!favorite };
  }
}
