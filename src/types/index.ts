export type UserRole = 'super_admin' | 'dispatch_admin' | 'security_staff' | 'maintenance_staff' | 'regular_staff';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainType: string;
  startStation: string;
  endStation: string;
  scheduledArrivalTime: string;
  scheduledDepartureTime: string;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  platform: string;
  track: string;
  status: 'on_time' | 'delayed' | 'early' | 'cancelled' | 'temporary';
  delayMinutes?: number;
  note?: string;
}

export interface PassengerFlow {
  id: string;
  area: string;
  currentCount: number;
  maxCapacity: number;
  density: number;
  inCount: number;
  outCount: number;
  lastUpdated: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface TicketingInfo {
  id: string;
  trainNumber: string;
  date: string;
  totalTickets: number;
  soldTickets: number;
  remainingTickets: number;
  checkedPassengers: number;
  uncheckedPassengers: number;
}

export interface SecurityDevice {
  id: string;
  name: string;
  type: 'camera' | 'scanner' | 'turnstile' | 'smoke_detector' | 'alarm';
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastCheck: string;
}

export interface SecurityAlert {
  id: string;
  type: 'device_error' | 'fire' | 'prohibited_item' | 'security_event';
  level: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
  resolvedBy?: string;
  resolvedTime?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'seat' | 'elevator' | 'escalator' | 'air_conditioning' | 'lighting' | 'toilet' | 'broadcast' | 'display';
  location: string;
  model: string;
  installationDate: string;
  status: 'normal' | 'maintenance' | 'fault' | 'scrapped';
  lastInspection: string;
  nextInspection: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  equipmentId: string;
  equipmentName: string;
  description: string;
  reporter: string;
  reportTime: string;
  assignee?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  resolution?: string;
}

export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  gender: 'male' | 'female';
  position: string;
  department: string;
  phone: string;
  status: 'on_duty' | 'off_duty' | 'leave' | 'business_trip';
  lastCheckIn?: string;
  lastCheckOut?: string;
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'day_off';
  startTime: string;
  endTime: string;
  location: string;
}

export interface EmergencyPlan {
  id: string;
  name: string;
  category: 'delay' | 'passenger_stuck' | 'weather' | 'equipment_failure' | 'medical' | 'security';
  description: string;
  steps: string[];
  responsibleDepartments: string[];
}

export interface EmergencyRecord {
  id: string;
  planId: string;
  planName: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'resolved';
  description: string;
  handler: string;
  notes?: string;
}

export interface StatisticsData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trainCounts: { date: string; count: number }[];
  passengerCounts: { date: string; inCount: number; outCount: number }[];
  peakHours: { hour: number; count: number }[];
  equipmentFailureRate: { month: string; rate: number }[];
  attendanceRate: { month: string; rate: number }[];
  ticketingData: { date: string; total: number; sold: number }[];
}
