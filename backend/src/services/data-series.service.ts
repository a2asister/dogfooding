import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSeries } from '../entities/data-series.entity';
import { DataPoint } from '../entities/data-point.entity';
import { FormulaParserService } from './formula-parser.service';
import { DataAnalysisService } from './data-analysis.service';

export interface CreateSeriesDto {
  name: string;
  description?: string;
  formula?: string;
  parameters?: Record<string, number>;
  points?: Array<{ x: number; y: number }>;
  start?: number;
  end?: number;
  step?: number;
}

@Injectable()
export class DataSeriesService {
  constructor(
    @InjectRepository(DataSeries)
    private dataSeriesRepository: Repository<DataSeries>,
    @InjectRepository(DataPoint)
    private dataPointRepository: Repository<DataPoint>,
    private formulaParser: FormulaParserService,
    private dataAnalysis: DataAnalysisService,
  ) {}

  async findAll(): Promise<DataSeries[]> {
    return this.dataSeriesRepository.find({
      where: { isDeleted: false },
      relations: ['points'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DataSeries> {
    const series = await this.dataSeriesRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['points'],
    });
    if (!series) {
      throw new NotFoundException(`Data series with ID ${id} not found`);
    }
    return series;
  }

  async create(dto: CreateSeriesDto): Promise<DataSeries> {
    let points: Array<{ x: number; y: number }> = [];

    if (dto.formula && dto.start !== undefined && dto.end !== undefined && dto.step !== undefined) {
      points = this.formulaParser.generateSeries(dto.formula, dto.start, dto.end, dto.step, dto.parameters);
    } else if (dto.points) {
      points = dto.points;
    }

    const analyzedPoints = this.dataAnalysis.analyzeFullSeries(points);

    const series = this.dataSeriesRepository.create({
      name: dto.name,
      description: dto.description,
      formula: dto.formula,
      parameters: dto.parameters,
      points: analyzedPoints.map((p) => this.dataPointRepository.create(p)),
    });

    return this.dataSeriesRepository.save(series);
  }

  async recalculate(id: string, dto: Partial<CreateSeriesDto>): Promise<DataSeries> {
    const series = await this.findOne(id);

    if (dto.formula && dto.start !== undefined && dto.end !== undefined && dto.step !== undefined) {
      const newPoints = this.formulaParser.generateSeries(dto.formula, dto.start, dto.end, dto.step, dto.parameters || series.parameters);
      const analyzedPoints = this.dataAnalysis.analyzeFullSeries(newPoints);

      await this.dataPointRepository.delete({ series: { id } });
      series.points = analyzedPoints.map((p) => this.dataPointRepository.create(p));
      series.formula = dto.formula;
      series.parameters = dto.parameters || series.parameters;
    }

    return this.dataSeriesRepository.save(series);
  }

  async delete(id: string): Promise<void> {
    const series = await this.findOne(id);
    series.isDeleted = true;
    await this.dataSeriesRepository.save(series);
  }

  async compareSeries(ids: string[]): Promise<{ series: DataSeries[]; trendLines: any[] }> {
    const seriesList = await Promise.all(ids.map((id) => this.findOne(id)));
    const trendLines = seriesList.map((s) => ({
      seriesId: s.id,
      seriesName: s.name,
      ...this.dataAnalysis.fitTrendLine(s.points),
    }));

    return { series: seriesList, trendLines };
  }

  getTrendAnalysis(id: string) {
    const series = this.findOne(id);
    return series.then((s) => ({
      seriesId: s.id,
      seriesName: s.name,
      ...this.dataAnalysis.fitTrendLine(s.points),
      pointsCount: s.points.length,
    }));
  }
}
