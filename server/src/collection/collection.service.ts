import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './collection.entity';

const DEFAULT_USER_ID = 'default-user-001';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  async findAllByUser(userId: string = DEFAULT_USER_ID): Promise<Collection[]> {
    return this.collectionRepository.find({ where: { userId } });
  }

  async getCollectedIds(userId: string = DEFAULT_USER_ID): Promise<string[]> {
    const collections = await this.collectionRepository.find({
      where: { userId, isCollected: true },
      select: ['characterId'],
    });
    return collections.map(c => c.characterId);
  }

  async collect(characterId: string, userId: string = DEFAULT_USER_ID): Promise<Collection> {
    let collection = await this.collectionRepository.findOne({
      where: { userId, characterId },
    });

    if (!collection) {
      collection = this.collectionRepository.create({
        userId,
        characterId,
        isCollected: true,
        count: 1,
      });
    } else {
      collection.isCollected = true;
      collection.count += 1;
    }

    return this.collectionRepository.save(collection);
  }

  async isCollected(characterId: string, userId: string = DEFAULT_USER_ID): Promise<boolean> {
    const collection = await this.collectionRepository.findOne({
      where: { userId, characterId, isCollected: true },
    });
    return !!collection;
  }

  async getStats(userId: string = DEFAULT_USER_ID): Promise<{ total: number; collected: number }> {
    const all = await this.collectionRepository.count({ where: { userId } });
    const collected = await this.collectionRepository.count({
      where: { userId, isCollected: true },
    });
    return { total: all, collected };
  }
}
