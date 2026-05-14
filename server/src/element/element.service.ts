import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Element } from '../entities/element.entity';
import { CreateElementDto } from './dto/create-element.dto';
import { UpdateElementDto } from './dto/update-element.dto';

@Injectable()
export class ElementService {
  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
  ) {}

  async create(createElementDto: CreateElementDto): Promise<Element> {
    const element = this.elementRepository.create(createElementDto);
    return this.elementRepository.save(element);
  }

  async findAll(): Promise<Element[]> {
    return this.elementRepository.find();
  }

  async findOne(id: number): Promise<Element> {
    const element = await this.elementRepository.findOne({ where: { id } });
    if (!element) {
      throw new NotFoundException(`Element with ID ${id} not found`);
    }
    return element;
  }

  async update(id: number, updateElementDto: UpdateElementDto): Promise<Element> {
    await this.elementRepository.update(id, updateElementDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.elementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Element with ID ${id} not found`);
    }
  }

  async bulkCreate(elements: CreateElementDto[]): Promise<Element[]> {
    const createdElements = this.elementRepository.create(elements);
    return this.elementRepository.save(createdElements);
  }
}
