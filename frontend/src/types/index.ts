export interface DashboardConfig {
  id?: string;
  name: string;
  description?: string;
  components: DashboardComponent[];
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface DashboardComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  config: Record<string, unknown>;
  data: ComponentData;
  animation?: ComponentAnimation;
}

export type ComponentType = 
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'radar-chart'
  | 'scatter-chart'
  | 'gauge-chart'
  | 'number-card'
  | 'text-card'
  | 'table-card'
  | 'progress-card';

export interface ComponentData {
  value?: number;
  values?: number[];
  labels?: string[];
  series?: DataSeries[];
  columns?: string[];
  rows?: Record<string, unknown>[];
}

export interface DataSeries {
  name: string;
  data: number[];
}

export interface ComponentAnimation {
  enter: string;
  exit: string;
  duration: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  config: string;
  isTemplate: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
