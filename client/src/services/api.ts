import request from './request';
import type {
  User,
  Department,
  DoctorSchedule,
  Appointment,
  Visit,
  MedicalRecord,
  Dictionary,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  StatisticsOverview,
} from '@/types';

export const authApi = {
  login: (data: LoginRequest) => request.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => request.post<LoginResponse>('/auth/register', data),
  getProfile: () => request.get<User>('/auth/profile'),
  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    request.put('/auth/password', data),
  updateProfile: (data: Partial<User>) => request.put<User>('/auth/profile', data),
};

export const departmentApi = {
  getList: () => request.get<Department[]>('/departments'),
  getAll: () => request.get<Department[]>('/departments/all'),
  create: (data: Partial<Department>) => request.post('/departments', data),
  update: (id: number, data: Partial<Department>) => request.put(`/departments/${id}`, data),
  delete: (id: number) => request.delete(`/departments/${id}`),
};

export const doctorApi = {
  getList: (departmentId?: number) =>
    request.get<User[]>('/doctors', { params: { departmentId } }),
  getDetail: (id: number) => request.get<User & { schedules: DoctorSchedule[] }>(`/doctors/${id}`),
  getSchedules: (doctorId: number, date?: string) =>
    request.get<DoctorSchedule[]>(`/doctors/${doctorId}/schedules`, { params: { date } }),
};

export const appointmentApi = {
  getList: (status?: string) => request.get<Appointment[]>('/appointments', { params: { status } }),
  create: (data: {
    scheduleId: number;
    appointmentDate: string;
    timeSlot: string;
    doctorId: number;
  }) => request.post<{ id: number }>('/appointments', data),
  cancel: (id: number) => request.put(`/appointments/${id}/cancel`),
};

export const visitApi = {
  getTodayList: () => request.get<Visit[]>('/visits/today'),
  receive: (id: number) => request.put(`/visits/${id}/receive`),
  finish: (id: number) => request.put(`/visits/${id}/finish`),
  createWalkIn: (data: { patientName: string; patientPhone: string; doctorId: number }) =>
    request.post<{ id: number }>('/visits/walk-in', data),
};

export const medicalRecordApi = {
  getByVisit: (visitId: number) => request.get<MedicalRecord>(`/medical-records/visit/${visitId}`),
  save: (data: {
    visitId: number;
    chiefComplaint?: string;
    presentIllness?: string;
    diagnosis?: string;
  }) => request.post('/medical-records', data),
  getPatientRecords: (patientId?: number) =>
    request.get<MedicalRecord[]>('/medical-records/patient', { params: { patientId } }),
};

export const adminApi = {
  getAccounts: (role?: string) => request.get<User[]>('/admin/accounts', { params: { role } }),
  createAccount: (data: Partial<User> & { password?: string }) =>
    request.post<{ id: number }>('/admin/accounts', data),
  updateAccount: (id: number, data: Partial<User>) => request.put(`/admin/accounts/${id}`, data),
  resetPassword: (id: number, newPassword?: string) =>
    request.put(`/admin/accounts/${id}/reset-password`, { newPassword }),
  getScheduleConfig: () => request.get<DoctorSchedule[]>('/admin/schedule/config'),
  saveScheduleConfig: (schedules: DoctorSchedule[]) =>
    request.post('/admin/schedule/config', { schedules }),
  toggleSchedule: (id: number, isEnabled: number) =>
    request.put(`/admin/schedule/${id}/toggle`, { is_enabled: isEnabled }),
  getStatistics: () =>
    request.get<{
      overview: StatisticsOverview;
      last7DaysAppointments: { date: string; count: number }[];
      departmentStats: { department_name: string; appointment_count: number }[];
    }>('/admin/statistics/overview'),
};

export const dictionaryApi = {
  getByType: (type: string) => request.get<Dictionary[]>(`/dictionary/type/${type}`),
  getAll: () => request.get<Record<string, Dictionary[]>>('/dictionary/all'),
  create: (data: Partial<Dictionary>) => request.post('/dictionary', data),
  update: (id: number, data: Partial<Dictionary>) => request.put(`/dictionary/${id}`, data),
  delete: (id: number) => request.delete(`/dictionary/${id}`),
  getOperationLogs: (page = 1, pageSize = 20) =>
    request.get<{ list: unknown[]; total: number }>('/dictionary/operation-logs', {
      params: { page, pageSize },
    }),
};

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<{ url: string; filename: string; size: number }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMessages: () => request.get('/upload/messages'),
  markMessageRead: (id: number) => request.put(`/upload/messages/${id}/read`),
};
