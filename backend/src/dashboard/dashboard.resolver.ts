import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { Dashboard } from '../entities/dashboard.entity';
import { CreateDashboardInput, UpdateDashboardInput } from '../dto/dashboard.dto';

@ObjectType()
class Statistics {
  @Field()
  total!: number;

  @Field()
  templates!: number;

  @Field()
  totalViews!: number;
}

@Resolver(() => Dashboard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => [Dashboard])
  async dashboards(): Promise<Dashboard[]> {
    return this.dashboardService.findAll();
  }

  @Query(() => [Dashboard])
  async dashboardTemplates(): Promise<Dashboard[]> {
    return this.dashboardService.findAllTemplates();
  }

  @Query(() => Dashboard)
  async dashboard(@Args('id', { type: () => ID }) id: string): Promise<Dashboard> {
    return this.dashboardService.findOne(id);
  }

  @Mutation(() => Dashboard)
  async createDashboard(@Args('input') input: CreateDashboardInput): Promise<Dashboard> {
    return this.dashboardService.create(input);
  }

  @Mutation(() => Dashboard)
  async updateDashboard(@Args('input') input: UpdateDashboardInput): Promise<Dashboard> {
    return this.dashboardService.update(input);
  }

  @Mutation(() => Boolean)
  async deleteDashboard(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.dashboardService.delete(id);
  }

  @Mutation(() => Dashboard)
  async incrementViewCount(@Args('id', { type: () => ID }) id: string): Promise<Dashboard> {
    return this.dashboardService.incrementViewCount(id);
  }

  @Query(() => Statistics)
  async dashboardStatistics(): Promise<Statistics> {
    return this.dashboardService.getStatistics();
  }
}
