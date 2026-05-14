import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outfit } from '../entities/outfit.entity';
import { Clothing } from '../entities/clothing.entity';

@Injectable()
export class OutfitService {
  constructor(
    @InjectRepository(Outfit)
    private outfitRepository: Repository<Outfit>,
    @InjectRepository(Clothing)
    private clothingRepository: Repository<Clothing>,
  ) {}

  findAll(): Promise<Outfit[]> {
    return this.outfitRepository.find({ relations: ['clothingItems'] });
  }

  findOne(id: string): Promise<Outfit | null> {
    return this.outfitRepository.findOne({ where: { id }, relations: ['clothingItems'] });
  }

  async create(outfitData: Partial<Outfit> & { clothingIds?: string[] }): Promise<Outfit> {
    const clothingItems = outfitData.clothingIds
      ? await this.clothingRepository.findByIds(outfitData.clothingIds)
      : [];
    
    const { clothingIds, ...restData } = outfitData;
    
    const outfit = this.outfitRepository.create({
      ...restData,
      clothingItems,
    });
    return this.outfitRepository.save(outfit);
  }

  async update(id: string, outfitData: Partial<Outfit> & { clothingIds?: string[] }): Promise<Outfit | null> {
    const outfit = await this.outfitRepository.findOne({ where: { id } });
    if (!outfit) return null;

    if (outfitData.clothingIds) {
      outfit.clothingItems = await this.clothingRepository.findByIds(outfitData.clothingIds);
    }

    const { clothingIds, ...restData } = outfitData;
    Object.assign(outfit, restData);
    return this.outfitRepository.save(outfit);
  }

  async remove(id: string): Promise<void> {
    await this.outfitRepository.delete(id);
  }
}
