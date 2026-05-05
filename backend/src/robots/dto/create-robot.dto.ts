import { IsString, IsNumber, IsOptional, IsObject, IsArray } from 'class-validator';
import { Position, RobotStatus } from '../interfaces/robot.interface';

export class CreateRobotDto {
  @IsString()
  name: string;

  @IsOptional()
  status?: RobotStatus = 'idle';

  @IsOptional()
  @IsObject()
  position?: Position = { x: 0, y: 0 };

  @IsOptional()
  @IsNumber()
  batteryLevel?: number = 100;

  @IsOptional()
  @IsNumber()
  speed?: number = 1.0;
}

export class UpdateRobotDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  status?: RobotStatus;

  @IsOptional()
  @IsObject()
  position?: Position;

  @IsOptional()
  @IsNumber()
  batteryLevel?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsString()
  currentTaskId?: string;

  @IsOptional()
  @IsArray()
  path?: Position[];

  @IsOptional()
  @IsNumber()
  currentPathIndex?: number;
}
