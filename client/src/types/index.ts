export interface User {
  id: number;
  studentId: string;
  name: string;
  role: string;
  department: string;
  major: string;
  class: string;
  phone?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  enrollmentDate?: string;
}

export interface Course {
  id: number;
  name: string;
  teacher: string;
  credit: number;
  capacity: number;
  enrolled: number;
  description: string;
  semester: string;
  selected?: number;
}

export interface Schedule {
  id: number;
  userId: number;
  courseId: number;
  courseName: string;
  teacher: string;
  weekDay: number;
  startPeriod: number;
  endPeriod: number;
  location: string;
  credit?: number;
}

export interface Grade {
  id: number;
  userId: number;
  courseId: number;
  courseName: string;
  score: number;
  gradePoint: number;
  semester: string;
  createdAt: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  views: number;
  publishTime: string;
  createdAt: string;
}

export interface Message {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: number;
  createdAt: string;
}

export interface Evaluation {
  id: number;
  userId: number;
  courseId: number;
  courseName: string;
  teacherName: string;
  teachingScore?: number;
  contentScore?: number;
  overallScore?: number;
  comment?: string;
  submitted: number;
  createdAt: string;
}

export interface LoginRecord {
  id: number;
  userId: number;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface DashboardData {
  todaySchedules: Schedule[];
  unreadCount: number;
  pendingEvaluations: number;
  recentGrades: Grade[];
  gpa: number;
  totalCredits: number;
  notifications: Message[];
}
