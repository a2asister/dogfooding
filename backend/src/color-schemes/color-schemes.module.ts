import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorSchemesService } from './color-schemes.service';
import { ColorSchemesResolver } from './color-schemes.resolver';
import { ColorScheme } from './entities/color-scheme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColorScheme])],
  providers: [ColorSchemesResolver, ColorSchemesService],
})
export class ColorSchemesModule {}
