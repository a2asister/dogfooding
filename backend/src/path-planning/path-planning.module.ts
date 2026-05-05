import { Module } from '@nestjs/common';
import { PathPlanningController } from './path-planning.controller';
import { PathPlanningService } from './path-planning.service';

@Module({
  controllers: [PathPlanningController],
  providers: [PathPlanningService],
  exports: [PathPlanningService],
})
export class PathPlanningModule {}
