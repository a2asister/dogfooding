import { Point } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    if (i === points.length - 1) {
      path += ` L ${curr.x} ${curr.y}`;
    } else {
      const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpy1 = prev.y + (curr.y - prev.y) * 0.5;
      const cpx2 = curr.x - (next.x - prev.x) * 0.25;
      const cpy2 = curr.y - (next.y - prev.y) * 0.25;
      path += ` Q ${cpx1} ${cpy1} ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
}

export function snapToGrid(x: number, y: number, gridSize: number = 20): Point {
  return {
    id: '',
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

export function findNearestPoint(
  x: number,
  y: number,
  points: Point[],
  threshold: number = 30
): Point | null {
  let nearest: Point | null = null;
  let minDist = threshold;

  for (const point of points) {
    const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  }

  return nearest;
}

export function optimizeTurningPoints(points: Point[], threshold: number = 5): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(angle2 - angle1);

    if (angleDiff > threshold * (Math.PI / 180)) {
      result.push(curr);
    }
  }

  result.push(points[points.length - 1]);

  return result;
}

export function calculatePathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}