import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './pet.entity';
import { PetPhoto } from './pet-photo.entity';
import { GrowthRecord } from './growth-record.entity';
import { PetService } from './pet.service';
import { PetResolver } from './pet.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, PetPhoto, GrowthRecord])],
  providers: [PetService, PetResolver],
})
export class PetModule {}
