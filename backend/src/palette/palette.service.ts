import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColorPalette } from '../entity/ColorPalette';

@Injectable()
export class PaletteService {
  constructor(
    @InjectRepository(ColorPalette)
    private paletteRepository: Repository<ColorPalette>,
  ) {}

  findAll(): Promise<ColorPalette[]> {
    return this.paletteRepository.find({ order: { createdAt: 'DESC' } });
  }

  create(palette: { name: string; colors: string[] }): Promise<ColorPalette> {
    const newPalette = this.paletteRepository.create(palette);
    return this.paletteRepository.save(newPalette);
  }

  async remove(id: number): Promise<void> {
    await this.paletteRepository.delete(id);
  }
}
