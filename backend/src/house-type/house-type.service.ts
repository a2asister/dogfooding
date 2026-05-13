import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseType } from '../entities/house-type.entity';
import { CreateHouseTypeInput } from '../dto/house-type.input';

@Injectable()
export class HouseTypeService {
  constructor(
    @InjectRepository(HouseType)
    private houseTypeRepository: Repository<HouseType>,
  ) {}

  async findAll(): Promise<HouseType[]> {
    return this.houseTypeRepository.find({ relations: ['houses'] });
  }

  async findOne(id: number): Promise<HouseType | null> {
    return this.houseTypeRepository.findOne({ where: { id }, relations: ['houses'] });
  }

  async create(input: CreateHouseTypeInput): Promise<HouseType> {
    const houseType = this.houseTypeRepository.create(input);
    return this.houseTypeRepository.save(houseType);
  }
}
