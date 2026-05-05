import { Controller, Get, Post, Body } from '@nestjs/common';
import { PathPlanningService } from './path-planning.service';
import { PlanPathDto } from './dto/plan-path.dto';
import { PathPlanningResult } from './interfaces/path-planning.interface';

@Controller('api/path-planning')
export class PathPlanningController {
  constructor(private readonly pathPlanningService: PathPlanningService) {}

  @Post('plan')
  planPath(@Body() planPathDto: PlanPathDto): PathPlanningResult {
    return this.pathPlanningService.planPath(
      planPathDto.start,
      planPathDto.end,
      planPathDto.obstacles,
    );
  }

  @Get('map')
  getMapGrid() {
    return this.pathPlanningService.getMapGrid();
  }
}
