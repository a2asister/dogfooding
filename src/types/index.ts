export type TaskType = 'timer' | 'pending' | 'idle' | 'prepare' | 'poll' | 'check' | 'close' | 'closeCallbacks';

export type RoadStatus = 'normal' | 'congested' | 'blocked' | 'unknown';

export type AlarmLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlarmType = 'accident' | 'congestion' | 'illegalParking' | 'roadOccupation' | 'deviceOffline';

export type DeviceStatus = 'online' | 'offline' | 'fault' | 'maintenance';

export type DeviceType = 'trafficLight' | 'camera' | 'magneticSensor';

export type SignalState = 'red' | 'green' | 'yellow';

export type PermissionLevel = 'view' | 'operate' | 'config' | 'admin';

export interface Coordinate {
  x: number;
  y: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  startPoint: Coordinate;
  endPoint: Coordinate;
  lanes: number;
  status: RoadStatus;
  speedLimit: number;
  currentSpeed: number;
  trafficDensity: number;
}

export interface Intersection {
  id: string;
  name: string;
  coordinate: Coordinate;
  roads: string[];
  signalState: SignalState;
  signalTiming: SignalTiming;
}

export interface SignalTiming {
  redDuration: number;
  greenDuration: number;
  yellowDuration: number;
  isLocked: boolean;
  lastModified: number;
  modifiedBy?: string;
}

export interface TrafficFlowData {
  timestamp: number;
  roadId: string;
  volume: number;
  avgSpeed: number;
  density: number;
}

export interface AlarmRecord {
  id: string;
  type: AlarmType;
  level: AlarmLevel;
  location: Coordinate;
  intersectionId?: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'resolved';
 处理时长?: number;
  处理人?: string;
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  location: Coordinate;
  intersectionId?: string;
  status: DeviceStatus;
  lastHeartbeat: number;
  batteryLevel?: number;
  signalDelay?: number;
  faultCount: number;
  maintenanceRecords: MaintenanceRecord[];
}

export interface MaintenanceRecord {
  id: string;
  deviceId: string;
  timestamp: number;
  type: 'repair' | 'inspection' | 'batteryReplacement';
  description: string;
  technician: string;
}

export interface StatisticsData {
  date: string;
  totalTrafficVolume: number;
  congestionDuration: number;
  alarmCount: number;
  deviceFaultCount: number;
  signalSchedulingCount: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  permissions: PermissionLevel[];
  lastLogin: number;
}

export interface OperationLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  target: string;
  timestamp: number;
  details?: string;
}

export interface BroadcastMessage {
  id: string;
  intersectionId: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'playing' | 'completed';
}