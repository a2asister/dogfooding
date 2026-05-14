export type ShapeType = 'circle' | 'triangle' | 'square' | 'pentagon' | 'hexagon';

export interface FissionConfig {
  shapeType: ShapeType;
  fissionCount: number;
  speed: number;
  spreadRange: number;
  rotationSpeed: number;
  colors: string[];
  trailEnabled: boolean;
  bounceEnabled: boolean;
  gravityEnabled: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  shapeType: ShapeType;
  originX: number;
  originY: number;
  phase: 'spread' | 'bounce' | 'stable';
  trail: { x: number; y: number }[];
}

export interface SavedWork {
  id?: number;
  name: string;
  config: FissionConfig;
  thumbnail: string;
  createdAt: string;
}

export interface Template {
  id?: number;
  name: string;
  config: FissionConfig;
  thumbnail: string;
  category: string;
}

export interface CreationRecord {
  id?: number;
  workId: number;
  action: string;
  createdAt: string;
}
