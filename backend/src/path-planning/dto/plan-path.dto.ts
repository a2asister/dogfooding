import { IsObject, IsOptional } from 'class-validator';
import { Position } from '../../robots/interfaces/robot.interface';

export class PlanPathDto {
  @IsObject()
  start: Position;

  @IsObject()
  end: Position;

  @IsOptional()
  @IsObject()
  obstacles?: Position[];
}
