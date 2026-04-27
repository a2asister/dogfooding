export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  email?: string;
  jobStatus: JobStatus;
  resumeCompleteRate: number;
  createdAt: string;
}

export type JobStatus = 'active' | 'passive' | 'offline';

export interface Job {
  id: string;
  title: string;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: 'K' | 'W';
  location: string;
  experience: string;
  education: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyIndustry: string;
  companySize: string;
  tags: string[];
  description: string;
  requirements: string[];
  workTime: string;
  workAddress: string;
  benefits: string[];
  recruitCount: number;
  hrId: string;
  hrName: string;
  hrAvatar: string;
  hrTitle: string;
  isFavorite: boolean;
  isApplied: boolean;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  stage: string;
  description: string;
  businessInfo: BusinessInfo;
  benefits: string[];
  officeAddress: string;
  jobCount: number;
  isFollowed: boolean;
  createdAt: string;
}

export interface BusinessInfo {
  legalPerson: string;
  registeredCapital: string;
  establishedDate: string;
  businessStatus: string;
  businessScope: string;
}

export interface Resume {
  id: string;
  userId: string;
  basicInfo: ResumeBasicInfo;
  jobIntention: JobIntention;
  workExperiences: WorkExperience[];
  projectExperiences: ProjectExperience[];
  educations: Education[];
  skills: Skill[];
  certificates: Certificate[];
  selfEvaluation: string;
  privacyStatus: PrivacyStatus;
  completeRate: number;
  updatedAt: string;
}

export interface ResumeBasicInfo {
  name: string;
  phone: string;
  email: string;
  avatar: string;
  gender: 'male' | 'female';
  birthday: string;
  location: string;
  workYears: number;
}

export interface JobIntention {
  expectedPosition: string[];
  expectedCity: string[];
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  jobType: JobType;
  entryTime: string;
}

export type JobType = 'fulltime' | 'parttime' | 'internship';

export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface ProjectExperience {
  id: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  id: string;
  schoolName: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years: number;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  validUntil?: string;
  certificateNo?: string;
}

export type PrivacyStatus = 'public' | 'delivery_only' | 'private';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  salaryMin: number;
  salaryMax: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  isMarked: boolean;
}

export type ApplicationStatus = 'pending' | 'viewed' | 'interview' | 'failed' | 'hired' | 'rejected';

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  interviewer: string;
  interviewerTitle: string;
  interviewTime: string;
  interviewType: 'online' | 'offline' | 'phone';
  interviewAddress?: string;
  interviewLink?: string;
  status: InterviewStatus;
  notes?: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export type InterviewStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export interface Message {
  id: string;
  type: MessageType;
  from: string;
  fromAvatar: string;
  fromName: string;
  to: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export type MessageType = 'system' | 'hr' | 'interview' | 'activity';

export interface ChatSession {
  id: string;
  userId: string;
  hrId: string;
  hrName: string;
  hrAvatar: string;
  companyName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

export interface Favorite {
  id: string;
  type: 'job' | 'company';
  targetId: string;
  targetData: Job | Company;
  createdAt: string;
}

export interface BrowseHistory {
  id: string;
  type: 'job' | 'company';
  targetId: string;
  targetData: Job | Company;
  viewedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FilterOptions {
  salaryRange?: [number, number];
  experience?: string[];
  education?: string[];
  industry?: string[];
  jobType?: JobType[];
  distance?: number;
  keyword?: string;
  city?: string;
}

export interface SortOptions {
  field: 'relevance' | 'newest' | 'salary_asc' | 'salary_desc';
  order: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  code: number;
}
