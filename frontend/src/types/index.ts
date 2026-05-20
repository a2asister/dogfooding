export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'basic' | 'advanced';
  teacherId: string;
  content: string;
  thumbnail?: string;
  isPublic: boolean;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  teacherName: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  description?: string;
  teacherName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  courseId: string;
  teacherId: string;
  classId: string;
  deadline: string;
  courseName?: string;
  className?: string;
  teacherName?: string;
  submitted?: boolean;
  score?: number;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  content: string;
  code: string;
  score?: number;
  comment?: string;
  submittedAt: string;
  gradedAt?: string;
  studentName?: string;
  studentAvatar?: string;
  homeworkTitle?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: 'easy' | 'medium' | 'hard';
  content: string;
  expectedOutput?: string;
  points: number;
  completed?: boolean;
  createdAt: string;
}

export interface ChallengeProgress {
  id: string;
  challengeId: string;
  studentId: string;
  completed: boolean;
  attempts: number;
  code?: string;
  completedAt?: string;
  title: string;
  description: string;
  level: string;
  points: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  studentId: string;
  code: string;
  blocksXml: string;
  isPublic: boolean;
  category?: string;
  views: number;
  likes: number;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WrongQuestion {
  id: string;
  studentId: string;
  challengeId?: string;
  homeworkId?: string;
  questionTitle: string;
  wrongCode: string;
  correctCode?: string;
  note?: string;
  challengeTitle?: string;
  homeworkTitle?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earnedAt?: string;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  studentId: string;
  month: string;
  totalStudyHours: number;
  completedCourses: number;
  completedChallenges: number;
  homeworkScore: number;
  pointsEarned: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'course' | 'homework' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}
