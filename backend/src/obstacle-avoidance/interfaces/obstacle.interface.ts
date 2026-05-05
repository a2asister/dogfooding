import { Position } from '../../robots/interfaces/robot.interface';

export type ObstacleType = 'static' | 'dynamic';

export interface Obstacle {
  id: string;
  position: Position;
  type: ObstacleType;
  size: number;
}

export interface ObstacleDetectionResult {
  obstacles: Obstacle[];
  safePath: Position[];
  isSafe: boolean;
}
