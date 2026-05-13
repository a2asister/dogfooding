import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColorScheme } from './entities/color-scheme.entity';
import { CreateColorSchemeInput } from './dto/create-color-scheme.input';
import { UpdateColorSchemeInput } from './dto/update-color-scheme.input';

@Injectable()
export class ColorSchemesService {
  constructor(
    @InjectRepository(ColorScheme)
    private colorSchemeRepository: Repository<ColorScheme>,
  ) {}

  create(createColorSchemeInput: CreateColorSchemeInput): Promise<ColorScheme> {
    const colorScheme = this.colorSchemeRepository.create(createColorSchemeInput);
    return this.colorSchemeRepository.save(colorScheme);
  }

  findAll(): Promise<ColorScheme[]> {
    return this.colorSchemeRepository.find({ where: { isArchived: false } });
  }

  findFavorites(): Promise<ColorScheme[]> {
    return this.colorSchemeRepository.find({ where: { isFavorite: true, isArchived: false } });
  }

  findArchived(): Promise<ColorScheme[]> {
    return this.colorSchemeRepository.find({ where: { isArchived: true } });
  }

  findTemplates(): Promise<ColorScheme[]> {
    return this.colorSchemeRepository.find({ where: { isTemplate: true, isArchived: false } });
  }

  async findOne(id: string): Promise<ColorScheme> {
    const colorScheme = await this.colorSchemeRepository.findOne({ where: { id } });
    if (!colorScheme) {
      throw new NotFoundException(`Color scheme #${id} not found`);
    }
    return colorScheme;
  }

  async update(id: string, updateColorSchemeInput: UpdateColorSchemeInput): Promise<ColorScheme> {
    const colorScheme = await this.findOne(id);
    Object.assign(colorScheme, updateColorSchemeInput);
    return this.colorSchemeRepository.save(colorScheme);
  }

  async remove(id: string): Promise<ColorScheme> {
    const colorScheme = await this.findOne(id);
    await this.colorSchemeRepository.remove(colorScheme);
    return { ...colorScheme, id };
  }

  async toggleFavorite(id: string): Promise<ColorScheme> {
    const colorScheme = await this.findOne(id);
    colorScheme.isFavorite = !colorScheme.isFavorite;
    return this.colorSchemeRepository.save(colorScheme);
  }

  async toggleArchive(id: string): Promise<ColorScheme> {
    const colorScheme = await this.findOne(id);
    colorScheme.isArchived = !colorScheme.isArchived;
    return this.colorSchemeRepository.save(colorScheme);
  }
}
