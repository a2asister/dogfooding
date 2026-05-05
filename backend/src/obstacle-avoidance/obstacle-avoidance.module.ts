import { Module } from '@nestjs/common';
import { ObstacleAvoidanceController } from './obstacle-avoidance.controller';
import { ObstacleAvoidanceService } from './obstacle-avoidance.service';
import { PathPlanningModule } from '../path-planning/path-planning.module';

@Module({
  imports: [PathPlanningModule],
  controllers: [ObstacleAvoidanceController],
  providers: [ObstacleAvoidanceService],
  exports: [ObstacleAvoidanceService],
})
export class ObstacleAvoidanceModule {}
