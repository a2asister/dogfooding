export interface DataPoint {
  id?: string;
  x: number;
  y: number;
  isInflection: boolean;
  isPeak: boolean;
  isOutlier: boolean;
  createdAt?: string;
}

export interface DataSeries {
  id: string;
  name: string;
  description: string;
  formula: string;
  parameters: Record<string, number>;
  points: DataPoint[];
  createdAt: string;
}

export interface TrendLine {
  seriesId: string;
  seriesName: string;
  slope: number;
  intercept: number;
  r2: number;
}

export interface CreateSeriesRequest {
  name: string;
  description?: string;
  formula?: string;
  parameters?: Record<string, number>;
  points?: Array<{ x: number; y: number }>;
  start?: number;
  end?: number;
  step?: number;
}
