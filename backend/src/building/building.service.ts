import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from '../entities/building.entity';
import { CreateBuildingInput, UpdateBuildingInput } from '../dto/building.input';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find({ where: { isActive: true }, relations: ['floors', 'floors.houses'] });
  }

  async findOne(id: number): Promise<Building | null> {
    return this.buildingRepository.findOne({ where: { id }, relations: ['floors', 'floors.houses', 'floors.houses.houseType'] });
  }

  async create(input: CreateBuildingInput): Promise<Building> {
    const building = this.buildingRepository.create(input);
    return this.buildingRepository.save(building);
  }

  async update(id: number, input: UpdateBuildingInput): Promise<Building | null> {
    await this.buildingRepository.update(id, input);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.buildingRepository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }
}
