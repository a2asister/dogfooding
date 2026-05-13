import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House } from '../entities/house.entity';
import { CreateHouseInput, UpdateHouseInput } from '../dto/house.input';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private houseRepository: Repository<House>,
  ) {}

  async findAll(status?: string): Promise<House[]> {
    const where: any = { isActive: true };
    if (status) where.status = status;
    return this.houseRepository.find({ where, relations: ['floor', 'houseType'] });
  }

  async findOne(id: number): Promise<House | null> {
    return this.houseRepository.findOne({ where: { id }, relations: ['floor', 'houseType', 'floor.building'] });
  }

  async findByFloor(floorId: number): Promise<House[]> {
    return this.houseRepository.find({ where: { floorId, isActive: true }, relations: ['houseType'] });
  }

  async create(input: CreateHouseInput): Promise<House> {
    const house = this.houseRepository.create(input);
    return this.houseRepository.save(house);
  }

  async update(id: number, input: UpdateHouseInput): Promise<House | null> {
    await this.houseRepository.update(id, input);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.houseRepository.update(id, { isActive: false });
    return (result.affected ?? 0) > 0;
  }
}
