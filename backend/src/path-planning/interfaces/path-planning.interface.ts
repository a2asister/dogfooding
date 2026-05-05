import { Position } from '../../robots/interfaces/robot.interface';

export interface MapGrid {
  width: number;
  height: number;
  grid: number[][];
}

export interface PathNode {
  position: Position;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export interface PathPlanningResult {
  path: Position[];
  distance: number;
  found: boolean;
}
