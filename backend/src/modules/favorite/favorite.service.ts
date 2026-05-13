import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(userId: number, productId: number): Promise<Favorite> {
    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      product: { id: productId },
    });
    return this.favoriteRepository.save(favorite);
  }

  async findByUser(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.category', 'product.seller'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.favoriteRepository.delete(id);
  }
}
