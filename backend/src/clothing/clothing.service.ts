import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clothing } from '../entities/clothing.entity';

@Injectable()
export class ClothingService {
  constructor(
    @InjectRepository(Clothing)
    private clothingRepository: Repository<Clothing>,
  ) {}

  findAll(): Promise<Clothing[]> {
    return this.clothingRepository.find();
  }

  findOne(id: string): Promise<Clothing | null> {
    return this.clothingRepository.findOneBy({ id });
  }

  create(clothing: Partial<Clothing>): Promise<Clothing> {
    const newClothing = this.clothingRepository.create(clothing);
    return this.clothingRepository.save(newClothing);
  }

  async update(id: string, clothing: Partial<Clothing>): Promise<Clothing | null> {
    await this.clothingRepository.update(id, clothing);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.clothingRepository.delete(id);
  }
}
