export interface Point {
  id: string;
  x: number;
  y: number;
  isControl?: boolean;
}

export interface PathData {
  id: string;
  name: string;
  points: Point[];
  createdAt: number;
  updatedAt: number;
}

export interface PathVersion {
  id: string;
  pathId: string;
  versionNumber: number;
  data: PathData;
  createdAt: number;
  description: string;
}

export interface HistoryRecord {
  id: string;
  pathId: string;
  action: string;
  beforeData: PathData | null;
  afterData: PathData;
  timestamp: number;
}

export interface AnimationConfig {
  duration: number;
  ease: string;
  loop: boolean;
  flowSpeed: number;
  snapDistance: number;
}