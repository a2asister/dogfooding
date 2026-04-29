export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  studentNo?: string;
  studentId?: string;
  teacherNo?: string;
  gender?: 'male' | 'female';
  major?: string;
  gradeId?: string;
  classId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  grade?: {
    id: string;
    name: string;
    year: number;
  };
  class?: {
    id: string;
    name: string;
  };
}

export interface Grade {
  id: string;
  name: string;
  year: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  gradeId: string;
  description?: string;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  grade?: Grade;
}

export interface CourseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  location: string;
  startWeek: number;
  endWeek: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  teacherId: string;
  credit: number;
  totalHours: number;
  maxStudents: number;
  maxCapacity: number;
  currentStudents: number;
  enrolledCount: number;
  description?: string;
  syllabus?: string;
  prerequisites?: string;
  assessmentMethod?: string;
  status: 'draft' | 'published' | 'archived';
  isHot: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: CourseCategory;
  teacher?: {
    id: string;
    name: string;
    teacherNo?: string;
  };
  schedules?: CourseSchedule[];
}

export interface ElectiveBatch {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  startDate: string;
  endDate: string;
  gradeIds: string[];
  maxCredits: number;
  minCredits: number;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSelection {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  status: 'selected' | 'dropped' | 'completed';
  score?: number | null;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null;
  isPassed?: boolean | null;
  comment?: string | null;
  gradedAt?: string | null;
  isGraded?: boolean;
  selectedAt: string;
  droppedAt?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  student?: User;
  batch?: {
    id: string;
    name: string;
  };
}

export interface CourseFavorite {
  id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
  course?: Course;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  rows: T[];
  count: number;
  totalPages: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: UserRole;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}
