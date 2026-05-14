export interface MeasurementRecord {
  id: number;
  value: number;
  unit: string;
  label: string;
  createdAt: string;
}

export interface ScaleParams {
  id: number;
  unit: string;
  pixelsPerUnit: number;
  name: string;
}

export interface SizeTemplate {
  id: number;
  name: string;
  width: number;
  height: number;
  unit: string;
}

export interface MeasurementState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isMeasuring: boolean;
}
