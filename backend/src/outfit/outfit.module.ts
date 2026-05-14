import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Outfit } from '../entities/outfit.entity';
import { Clothing } from '../entities/clothing.entity';
import { OutfitService } from './outfit.service';
import { OutfitController } from './outfit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Outfit, Clothing])],
  controllers: [OutfitController],
  providers: [OutfitService],
})
export class OutfitModule {}
