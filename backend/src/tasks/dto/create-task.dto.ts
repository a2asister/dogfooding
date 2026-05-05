import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';
import { Position } from '../../robots/interfaces/robot.interface';
import { TaskPriority, TaskStatus } from '../interfaces/task.interface';

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string = '';

  @IsOptional()
  priority?: TaskPriority = 'medium';

  @IsObject()
  startPosition: Position;

  @IsObject()
  targetPosition: Position;

  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  priority?: TaskPriority;

  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assignedRobotId?: string;

  @IsOptional()
  @IsNumber()
  actualTime?: number;
}
