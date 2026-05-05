import { IsObject, IsNumber, IsOptional } from 'class-validator';
import { Position } from '../../robots/interfaces/robot.interface';
import { ObstacleType } from '../interfaces/obstacle.interface';

export class CreateObstacleDto {
  @IsObject()
  position: Position;

  @IsOptional()
  type?: ObstacleType = 'static';

  @IsOptional()
  @IsNumber()
  size?: number = 1;
}

export class CheckObstacleDto {
  @IsObject()
  start: Position;

  @IsObject()
  end: Position;

  @IsOptional()
  @IsNumber()
  safetyMargin?: number = 1;
}
