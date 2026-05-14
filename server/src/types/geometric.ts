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
