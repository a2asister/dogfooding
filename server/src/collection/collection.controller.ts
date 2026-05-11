import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { Collection } from './collection.entity';

@Controller('api/collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
  ): Promise<Collection[]> {
    return this.collectionService.findAllByUser(userId);
  }

  @Get('collected-ids')
  getCollectedIds(
    @Query('userId') userId?: string,
  ): Promise<string[]> {
    return this.collectionService.getCollectedIds(userId);
  }

  @Get('stats')
  getStats(
    @Query('userId') userId?: string,
  ): Promise<{ total: number; collected: number }> {
    return this.collectionService.getStats(userId);
  }

  @Post(':characterId/collect')
  collect(
    @Param('characterId') characterId: string,
    @Query('userId') userId?: string,
  ): Promise<Collection> {
    return this.collectionService.collect(characterId, userId);
  }

  @Get(':characterId/check')
  check(
    @Param('characterId') characterId: string,
    @Query('userId') userId?: string,
  ): Promise<boolean> {
    return this.collectionService.isCollected(characterId, userId);
  }
}
