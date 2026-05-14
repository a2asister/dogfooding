import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SizeTemplate } from './size-template.entity';
import { CreateSizeTemplateDto } from './dto/create-size-template.dto';

@Injectable()
export class SizeTemplateService {
  constructor(
    @InjectRepository(SizeTemplate)
    private sizeTemplateRepository: Repository<SizeTemplate>,
  ) {}

  async findAll(): Promise<SizeTemplate[]> {
    return this.sizeTemplateRepository.find();
  }

  async create(createSizeTemplateDto: CreateSizeTemplateDto): Promise<SizeTemplate> {
    const sizeTemplate = this.sizeTemplateRepository.create(createSizeTemplateDto);
    return this.sizeTemplateRepository.save(sizeTemplate);
  }

  async remove(id: number): Promise<void> {
    await this.sizeTemplateRepository.delete(id);
  }
}
