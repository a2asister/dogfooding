export interface FloodData {
  id: string;
  timestamp: number;
  upstreamWaterLevel: number;
  downstreamWaterLevel: number;
  dischargeFlow: number;
  dischargeDuration: number;
  openHoles: number[];
  totalHoles: number;
}

export interface WarningLevel {
  level: 'normal' | 'attention' | 'warning' | 'danger';
  threshold: number;
  message: string;
}

export interface Warning {
  id: string;
  type: 'upstreamLevel' | 'dischargeFlow';
  level: WarningLevel['level'];
  currentValue: number;
  threshold: number;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface HistoricalRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxDischargeFlow: number;
  avgDischargeFlow: number;
  maxUpstreamLevel: number;
  minUpstreamLevel: number;
  openHoles: number[];
  dataPoints: FloodData[];
}

export interface DamParams {
  height: number;
  crestElevation: number;
  totalLength: number;
  totalDischargeHoles: number;
  designDischargeCapacity: number;
  maxDischargeCapacity: number;
  normalPoolLevel: number;
  floodLimitLevel: number;
}

export interface SimulationParams {
  enabled: boolean;
  customOpenHoles: number[];
  customDischargeFlow: number;
}

export interface CameraView {
  type: 'front' | 'side' | 'top';
  position: [number, number, number];
  target: [number, number, number];
}

export type AppMode = 'real-time' | 'history' | 'simulation';
