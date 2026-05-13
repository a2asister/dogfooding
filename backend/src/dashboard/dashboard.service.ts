import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from '../entities/dashboard.entity';
import { CreateDashboardInput, UpdateDashboardInput } from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async findAll(): Promise<Dashboard[]> {
    return this.dashboardRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findAllTemplates(): Promise<Dashboard[]> {
    return this.dashboardRepository.find({
      where: { isTemplate: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Dashboard> {
    const dashboard = await this.dashboardRepository.findOne({ where: { id } });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID "${id}" not found`);
    }
    return dashboard;
  }

  async create(input: CreateDashboardInput): Promise<Dashboard> {
    const dashboard = this.dashboardRepository.create(input);
    return this.dashboardRepository.save(dashboard);
  }

  async update(input: UpdateDashboardInput): Promise<Dashboard> {
    const dashboard = await this.findOne(input.id);
    Object.assign(dashboard, input);
    return this.dashboardRepository.save(dashboard);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dashboardRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async incrementViewCount(id: string): Promise<Dashboard> {
    const dashboard = await this.findOne(id);
    dashboard.viewCount += 1;
    return this.dashboardRepository.save(dashboard);
  }

  async getStatistics(): Promise<{ total: number; templates: number; totalViews: number }> {
    const [dashboards, templates] = await Promise.all([
      this.dashboardRepository.find(),
      this.dashboardRepository.find({ where: { isTemplate: true } }),
    ]);
    const totalViews = dashboards.reduce((sum, d) => sum + d.viewCount, 0);
    return {
      total: dashboards.length,
      templates: templates.length,
      totalViews,
    };
  }
}
