import { Injectable } from '@nestjs/common';
import { Point } from './path.service';

@Injectable()
export class AlgorithmService {
  optimizePoints(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    const result: Point[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs(angle2 - angle1);

      if (angleDiff > 0.087) {
        result.push(curr);
      }
    }

    result.push(points[points.length - 1]);

    return result;
  }

  correctCoordinates(points: Point[]): Point[] {
    return points.map((point) => ({
      ...point,
      x: Math.round(point.x * 100) / 100,
      y: Math.round(point.y * 100) / 100,
    }));
  }

  compareDiff(before: Point[], after: Point[]) {
    const beforeMap = new Map(before.map((p) => [p.id, p]));
    const afterMap = new Map(after.map((p) => [p.id, p]));

    const added: Point[] = [];
    const removed: Point[] = [];
    const modified: Point[] = [];

    for (const point of after) {
      if (!beforeMap.has(point.id)) {
        added.push(point);
      } else {
        const beforePoint = beforeMap.get(point.id)!;
        if (beforePoint.x !== point.x || beforePoint.y !== point.y) {
          modified.push(point);
        }
      }
    }

    for (const point of before) {
      if (!afterMap.has(point.id)) {
        removed.push(point);
      }
    }

    return { added, removed, modified };
  }
}