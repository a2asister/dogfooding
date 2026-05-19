export type UserRole =
  | 'super_admin'
  | 'hospital_admin'
  | 'doctor'
  | 'nurse'
  | 'finance'
  | 'pharmacist'
  | 'technician'
  | 'patient';

export interface User {
  id: number;
  username: string;
  phone: string;
  real_name: string;
  id_card?: string;
  role: UserRole;
  department_id?: number;
  title?: string;
  license_no?: string;
  education?: string;
  hire_date?: string;
  is_active: number;
  created_at: string;
  avatar?: string;
  department_name?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: number;
  icon?: string;
}

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  department_id: number;
  schedule_date: string;
  time_slot: string;
  total_quota: number;
  used_quota: number;
  is_enabled: number;
  doctor_name?: string;
  department_name?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  schedule_id: number;
  appointment_date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  patient_name?: string;
  doctor_name?: string;
  department_name?: string;
}

export interface Visit {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_id?: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_name?: string;
  department_name?: string;
}

export interface MedicalRecord {
  id: number;
  visit_id: number;
  doctor_id: number;
  chief_complaint?: string;
  present_illness?: string;
  diagnosis?: string;
  created_at: string;
  updated_at?: string;
  patient_name?: string;
  patient_phone?: string;
  doctor_name?: string;
  visit_time?: string;
  department_name?: string;
}

export interface Dictionary {
  id: number;
  type: string;
  code: string;
  name: string;
  parent_code?: string;
  sort_order: number;
}

export interface OperationLog {
  id: number;
  user_id: number;
  operation: string;
  module: string;
  ip?: string;
  created_at: string;
  user_name?: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  real_name: string;
  id_card: string;
}

export interface StatisticsOverview {
  todayAppointments: number;
  todayVisits: number;
  totalPatients: number;
  totalDoctors: number;
}
