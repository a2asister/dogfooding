import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScaleParams } from './scale-params.entity';
import { CreateScaleParamsDto } from './dto/create-scale-params.dto';

@Injectable()
export class ScaleParamsService {
  constructor(
    @InjectRepository(ScaleParams)
    private scaleParamsRepository: Repository<ScaleParams>,
  ) {}

  async findAll(): Promise<ScaleParams[]> {
    return this.scaleParamsRepository.find();
  }

  async create(createScaleParamsDto: CreateScaleParamsDto): Promise<ScaleParams> {
    const scaleParams = this.scaleParamsRepository.create(createScaleParamsDto);
    return this.scaleParamsRepository.save(scaleParams);
  }

  async update(id: number, updateData: Partial<ScaleParams>): Promise<ScaleParams> {
    await this.scaleParamsRepository.update(id, updateData);
    const updated = await this.scaleParamsRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Scale params not found');
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.scaleParamsRepository.delete(id);
  }
}
