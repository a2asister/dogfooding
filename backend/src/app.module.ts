import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaletteModule } from './palette/palette.module';
import { ExportModule } from './export/export.module';
import { ColorPalette } from './entity/ColorPalette';
import { ExportRecord } from './entity/ExportRecord';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [ColorPalette, ExportRecord],
      synchronize: true,
    }),
    PaletteModule,
    ExportModule,
  ],
})
export class AppModule {}
