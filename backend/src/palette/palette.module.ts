import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaletteController } from './palette.controller';
import { PaletteService } from './palette.service';
import { ColorPalette } from '../entity/ColorPalette';

@Module({
  imports: [TypeOrmModule.forFeature([ColorPalette])],
  controllers: [PaletteController],
  providers: [PaletteService],
})
export class PaletteModule {}
