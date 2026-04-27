export interface Location {
  lat: number;
  lng: number;
}

export type VehicleStatus = 'online' | 'offline' | 'maintenance';
export type OperationalStatus = 'idle' | 'operating' | 'assigned';
export type DriverStatus = 'on duty' | 'off duty' | 'on leave';
export type OrderStatus = 'pending' | 'assigned' | 'accepted' | 'in_trip' | 'completed' | 'cancelled';
export type OrderPriority = 'high' | 'medium' | 'low';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';
export type TripStatus = 'pending' | 'in_progress' | 'completed' | 'abnormal';

export interface Vehicle {
  id: number;
  plate: string;
  status: VehicleStatus;
  driverId: number | null;
  location: Location;
  operationalStatus: OperationalStatus;
  battery: number;
  area: string;
  createdAt: string;
  isAbnormal: boolean;
  abnormalReason?: string;
}

export interface Driver {
  id: number;
  name: string;
  status: DriverStatus;
  orders: number;
  rating: number;
  workingHours: number;
  violations: number;
  shift: string;
  phone: string;
  licenseNumber: string;
  isLocked: boolean;
  isAbnormal: boolean;
  abnormalReason?: string;
}

export interface Order {
  id: number;
  dispatchNumber: string;
  status: OrderStatus;
  priority: OrderPriority;
  origin: string;
  originLocation: Location;
  destination: string;
  destinationLocation: Location;
  distance: number;
  estimatedCost: number;
  passengerName: string;
  passengerPhone: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  assignedVehicleId?: number;
  assignedDriverId?: number;
  isUrgent: boolean;
  isTimeout: boolean;
  timeoutMinutes?: number;
}

export interface Trip {
  id: number;
  orderId: number;
  dispatchNumber: string;
  vehicleId: number;
  driverId: number;
  status: TripStatus;
  origin: string;
  destination: string;
  currentLocation: Location;
  route: Location[];
  currentSpeed: number;
  estimatedArrival: string;
  travelTime: number;
  trafficStatus: 'smooth' | 'moderate' | 'congested';
  isAbnormal: boolean;
  abnormalReason?: string;
  events: TripEvent[];
}

export interface TripEvent {
  id: number;
  time: string;
  type: 'start' | 'checkpoint' | 'abnormal' | 'end';
  description: string;
  location: Location;
}

export interface Alert {
  id: number;
  level: AlertLevel;
  type: 'vehicle_offline' | 'trip_abnormal' | 'dispatch_timeout' | 'capacity_insufficient' | 'violation' | 'system';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isHandled: boolean;
  handledBy?: string;
  handledAt?: string;
  relatedId?: number;
}

export interface DispatchConfig {
  areas: Area[];
  dispatchRules: DispatchRule[];
  priorityRules: PriorityRule[];
  capacityThresholds: CapacityThreshold;
  alertParameters: AlertParameter[];
  schedulingStrategies: SchedulingStrategy[];
}

export interface Area {
  id: number;
  name: string;
  code: string;
  boundary: Location[];
  center: Location;
  isActive: boolean;
  priority: number;
}

export interface DispatchRule {
  id: number;
  name: string;
  description: string;
  rule: string;
  isActive: boolean;
  priority: number;
}

export interface PriorityRule {
  id: number;
  name: string;
  conditions: PriorityCondition[];
  weight: number;
  isActive: boolean;
}

export interface PriorityCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number | boolean;
}

export interface CapacityThreshold {
  minimumVehicles: number;
  warningThreshold: number;
  criticalThreshold: number;
  idleVehicleRatio: number;
}

export interface AlertParameter {
  id: number;
  type: string;
  name: string;
  threshold: number;
  unit: string;
  isEnabled: boolean;
}

export interface SchedulingStrategy {
  id: number;
  name: string;
  description: string;
  shiftStart: string;
  shiftEnd: string;
  vehicleCount: number;
  isActive: boolean;
}

export interface Passenger {
  id: number;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  hasComplaints: boolean;
}

export interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  capacityStats: CapacityStats;
  orderThroughput: OrderThroughput;
  dispatchEfficiency: DispatchEfficiency;
  driverAttendance: DriverAttendance;
  areaCapacityLoad: AreaCapacityLoad[];
  peakHours: PeakHour[];
}

export interface CapacityStats {
  totalVehicles: number;
  onlineVehicles: number;
  offlineVehicles: number;
  idleVehicles: number;
  operatingVehicles: number;
  averageUtilization: number;
}

export interface OrderThroughput {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  peakHourOrders: number;
  offPeakOrders: number;
}

export interface DispatchEfficiency {
  averageDispatchTime: number;
  dispatchSuccessRate: number;
  timeoutRate: number;
  reassignmentRate: number;
}

export interface DriverAttendance {
  totalDrivers: number;
  onDuty: number;
  offDuty: number;
  onLeave: number;
  averageWorkingHours: number;
}

export interface AreaCapacityLoad {
  areaName: string;
  totalVehicles: number;
  idleVehicles: number;
  operatingVehicles: number;
  loadRatio: number;
  orders: number;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
  vehicleCount: number;
  isPeak: boolean;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'operator';
  permissions: string[];
  phone: string;
  isActive: boolean;
  lastLogin: string;
}

export interface OperationLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  module: string;
  details: string;
  ip: string;
  createdAt: string;
  isSensitive: boolean;
}

export interface SystemState {
  isOnline: boolean;
  lastUpdate: string;
  refreshInterval: number;
  isAutoRefresh: boolean;
}
