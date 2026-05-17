export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Dashboard {
  id: number;
  name: string;
  description: string | null;
  thumbnail: string | null;
  config: DashboardConfig;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardConfig {
  width: number;
  height: number;
  components: ComponentInstance[];
  backgroundColor: string;
  backgroundImage?: string;
}

export type ComponentType =
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'radar-chart'
  | 'area-chart'
  | 'scatter-chart'
  | 'funnel-chart'
  | 'gauge-chart'
  | 'map-china'
  | 'text'
  | 'title'
  | 'image'
  | 'rectangle'
  | 'border'
  | 'table'
  | 'progress'
  | 'countup';

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  name: string;
  config: ComponentConfig;
  data: DataConfig;
  style: StyleConfig;
  animation: AnimationConfig;
  interaction: InteractionConfig;
}

export interface ComponentConfig {
  [key: string]: any;
}

export interface DataConfig {
  type: 'static' | 'mock' | 'api';
  staticData?: any[];
  mockConfig?: MockConfig;
  apiConfig?: ApiConfig;
}

export interface MockConfig {
  count: number;
  min: number;
  max: number;
}

export interface ApiConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  interval?: number;
}

export interface StyleConfig {
  [key: string]: any;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  delay: number;
}

export interface InteractionConfig {
  clickable: boolean;
  hoverable: boolean;
  tooltip: boolean;
  zoomable: boolean;
}

export interface EditorState {
  selectedId: string | null;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  history: DashboardConfig[];
  historyIndex: number;
}
