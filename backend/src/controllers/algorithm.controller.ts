import { Controller, Post, Body } from '@nestjs/common';
import { AlgorithmService } from '../services/algorithm.service';
import { Point } from '../services/path.service';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private readonly algorithmService: AlgorithmService) {}

  @Post('optimize')
  optimizePoints(@Body() data: { points: Point[] }): Point[] {
    return this.algorithmService.optimizePoints(data.points);
  }

  @Post('correct')
  correctCoordinates(@Body() data: { points: Point[] }): Point[] {
    return this.algorithmService.correctCoordinates(data.points);
  }

  @Post('diff')
  compareDiff(
    @Body() data: { before: Point[]; after: Point[] },
  ): { added: Point[]; removed: Point[]; modified: Point[] } {
    return this.algorithmService.compareDiff(data.before, data.after);
  }
}