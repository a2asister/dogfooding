export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  nickname: string;
  role: UserRole;
  avatar?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  grade?: string;
  points: number;
  level: number;
  parentId?: string;
  classId?: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  subject?: string;
  school?: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  childrenIds: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: 'easy' | 'medium' | 'hard';
  content: string;
  expectedOutput?: string;
  points: number;
  createdAt: string;
}

export interface ChallengeProgress {
  id: string;
  challengeId: string;
  studentId: string;
  completed: boolean;
  attempts: number;
  code: string;
  completedAt?: string;
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
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
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
