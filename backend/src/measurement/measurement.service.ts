import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';

@Injectable()
export class MeasurementService {
  constructor(
    @InjectRepository(Measurement)
    private measurementRepository: Repository<Measurement>,
  ) {}

  async findAll(): Promise<Measurement[]> {
    return this.measurementRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(createMeasurementDto: CreateMeasurementDto): Promise<Measurement> {
    const measurement = this.measurementRepository.create(createMeasurementDto);
    return this.measurementRepository.save(measurement);
  }

  async remove(id: number): Promise<void> {
    await this.measurementRepository.delete(id);
  }
}
