import { Injectable } from '@nestjs/common';

interface DataPoint {
  x: number;
  y: number;
  isInflection?: boolean;
  isPeak?: boolean;
  isOutlier?: boolean;
}

@Injectable()
export class DataAnalysisService {
  detectInflectionPoints(points: DataPoint[]): DataPoint[] {
    if (points.length < 3) return points;

    const result = points.map((p, i) => {
      if (i === 0 || i === points.length - 1) {
        return { ...p, isInflection: false };
      }

      const prevSlope = points[i].y - points[i - 1].y;
      const nextSlope = points[i + 1].y - points[i].y;

      if (prevSlope * nextSlope < 0) {
        return { ...p, isInflection: true };
      }
      return { ...p, isInflection: false };
    });

    return result;
  }

  detectPeaks(points: DataPoint[]): DataPoint[] {
    if (points.length < 3) return points;

    return points.map((p, i) => {
      if (i === 0 || i === points.length - 1) {
        return { ...p, isPeak: false };
      }

      const isPeak = points[i - 1].y < p.y && points[i + 1].y < p.y;
      const isValley = points[i - 1].y > p.y && points[i + 1].y > p.y;

      return { ...p, isPeak: isPeak || isValley };
    });
  }

  detectOutliers(points: DataPoint[]): DataPoint[] {
    if (points.length < 4) return points;

    const yValues = points.map((p) => p.y).sort((a, b) => a - b);
    const q1 = yValues[Math.floor(yValues.length / 4)];
    const q3 = yValues[Math.floor((3 * yValues.length) / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return points.map((p) => ({
      ...p,
      isOutlier: p.y < lowerBound || p.y > upperBound,
    }));
  }

  fitTrendLine(points: DataPoint[]): { slope: number; intercept: number; r2: number } {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const yMean = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const ssResidual = points.reduce(
      (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
      0,
    );
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }

  analyzeFullSeries(points: DataPoint[]): DataPoint[] {
    let result = this.detectInflectionPoints(points);
    result = this.detectPeaks(result);
    result = this.detectOutliers(result);
    return result;
  }
}
