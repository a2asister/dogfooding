import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSeries } from './entities/data-series.entity';
import { DataPoint } from './entities/data-point.entity';
import { DataSeriesController } from './controllers/data-series.controller';
import { DataSeriesService } from './services/data-series.service';
import { FormulaParserService } from './services/formula-parser.service';
import { DataAnalysisService } from './services/data-analysis.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/db.sqlite',
      entities: [DataSeries, DataPoint],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([DataSeries, DataPoint]),
  ],
  controllers: [DataSeriesController],
  providers: [DataSeriesService, FormulaParserService, DataAnalysisService, ReportService],
})
export class AppModule {}
