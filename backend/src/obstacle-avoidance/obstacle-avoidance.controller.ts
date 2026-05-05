import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ObstacleAvoidanceService } from './obstacle-avoidance.service';
import { CreateObstacleDto, CheckObstacleDto } from './dto/create-obstacle.dto';
import { Obstacle, ObstacleDetectionResult } from './interfaces/obstacle.interface';

@Controller('api/obstacles')
export class ObstacleAvoidanceController {
  constructor(private readonly obstacleAvoidanceService: ObstacleAvoidanceService) {}

  @Get()
  findAll(): Obstacle[] {
    return this.obstacleAvoidanceService.findAll();
  }

  @Get('dynamic')
  getDynamicObstacles(): Obstacle[] {
    return this.obstacleAvoidanceService.getDynamicObstacles();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  addObstacle(@Body() createObstacleDto: CreateObstacleDto): Obstacle {
    return this.obstacleAvoidanceService.addObstacle({
      position: createObstacleDto.position,
      type: createObstacleDto.type || 'static',
      size: createObstacleDto.size || 1,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeObstacle(@Param('id') id: string): void {
    this.obstacleAvoidanceService.removeObstacle(id);
  }

  @Post('check')
  checkPathForObstacles(
    @Body() checkObstacleDto: CheckObstacleDto,
  ): ObstacleDetectionResult {
    return this.obstacleAvoidanceService.checkPathForObstacles(
      checkObstacleDto.start,
      checkObstacleDto.end,
      checkObstacleDto.safetyMargin,
    );
  }

  @Post('update-dynamic')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateDynamicObstacles(): void {
    this.obstacleAvoidanceService.updateDynamicObstacles();
  }
}
