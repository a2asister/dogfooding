import { Selection } from '../types';

export const isPointInSelection = (
  x: number,
  y: number,
  selection: Selection | null,
  _canvasWidth?: number,
  _canvasHeight?: number
): boolean => {
  if (!selection) return true;

  switch (selection.type) {
    case 'rect':
      if (selection.bounds) {
        return (
          x >= selection.bounds.x &&
          x <= selection.bounds.x + selection.bounds.width &&
          y >= selection.bounds.y &&
          y <= selection.bounds.y + selection.bounds.height
        );
      }
      return true;

    case 'circle':
      if (selection.center && selection.radius) {
        const dx = x - selection.center.x;
        const dy = y - selection.center.y;
        return dx * dx + dy * dy <= selection.radius * selection.radius;
      }
      return true;

    case 'lasso':
      if (selection.path && selection.path.length > 2) {
        return pointInPolygon(x, y, selection.path);
      }
      return true;

    case 'magic':
      return true;

    default:
      return true;
  }
};

export const pointInPolygon = (
  x: number,
  y: number,
  polygon: { x: number; y: number }[]
): boolean => {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

export const getColorDifference = (
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number => {
  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;

  return Math.sqrt(
    (2 + rmean / 256) * r * r + 4 * g * g + (2 + (255 - rmean) / 256) * b * b
  );
};

export const magicWandSelection = (
  imageData: ImageData,
  startX: number,
  startY: number,
  width: number,
  height: number,
  tolerance: number = 32
): { path: { x: number; y: number }[]; bounds: { x: number; y: number; width: number; height: number } } => {
  const x = Math.floor(startX);
  const y = Math.floor(startY);

  if (x < 0 || x >= width || y < 0 || y >= height) {
    return { path: [], bounds: { x: 0, y: 0, width: 0, height: 0 } };
  }

  const startIdx = (y * width + x) * 4;
  const startR = imageData.data[startIdx];
  const startG = imageData.data[startIdx + 1];
  const startB = imageData.data[startIdx + 2];

  const visited = new Set<number>();
  const stack: { x: number; y: number }[] = [{ x, y }];
  const selected: { x: number; y: number }[] = [];

  let minX = x;
  let maxX = x;
  let minY = y;
  let maxY = y;

  while (stack.length > 0) {
    const point = stack.pop()!;
    const key = point.y * width + point.x;

    if (visited.has(key)) continue;
    visited.add(key);

    const idx = (point.y * width + point.x) * 4;
    const r = imageData.data[idx];
    const g = imageData.data[idx + 1];
    const b = imageData.data[idx + 2];

    const diff = getColorDifference(r, g, b, startR, startG, startB);

    if (diff <= tolerance) {
      selected.push(point);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);

      const neighbors = [
        { x: point.x - 1, y: point.y },
        { x: point.x + 1, y: point.y },
        { x: point.x, y: point.y - 1 },
        { x: point.x, y: point.y + 1 },
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.x >= 0 &&
          neighbor.x < width &&
          neighbor.y >= 0 &&
          neighbor.y < height
        ) {
          const neighborKey = neighbor.y * width + neighbor.x;
          if (!visited.has(neighborKey)) {
            stack.push(neighbor);
          }
        }
      }
    }
  }

  const bounds = {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };

  return { path: selected, bounds };
};
