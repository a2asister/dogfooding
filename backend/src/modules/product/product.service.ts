import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Favorite } from '../../entities/favorite.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      category: { id: createProductDto.categoryId },
      seller: { id: createProductDto.sellerId },
    });
    return this.productRepository.save(product);
  }

  async findAll(categoryId?: number): Promise<Product[]> {
    const where = categoryId ? { category: { id: categoryId } } : {};
    return this.productRepository.find({
      where,
      relations: ['category', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category', 'seller'],
    });
  }

  async findBySeller(sellerId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { seller: { id: sellerId } },
      relations: ['category', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    await this.favoriteRepository.delete({ product: { id } });
    await this.productRepository.delete(id);
  }
}
