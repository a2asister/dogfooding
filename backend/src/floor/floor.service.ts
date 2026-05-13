import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floor } from '../entities/floor.entity';

@Injectable()
export class FloorService {
  constructor(
    @InjectRepository(Floor)
    private floorRepository: Repository<Floor>,
  ) {}

  async findAll(buildingId?: number): Promise<Floor[]> {
    const where: any = { isActive: true };
    if (buildingId) where.buildingId = buildingId;
    return this.floorRepository.find({ where, relations: ['houses', 'houses.houseType'] });
  }

  async findOne(id: number): Promise<Floor | null> {
    return this.floorRepository.findOne({ where: { id }, relations: ['houses', 'building', 'houses.houseType'] });
  }

  async create(buildingId: number, floorNumber: number): Promise<Floor> {
    const floor = this.floorRepository.create({ buildingId, floorNumber });
    return this.floorRepository.save(floor);
  }
}
