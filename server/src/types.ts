export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  points: number;
  level: number;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  user_id: number;
  title: string;
  content: string;
  summary?: string;
  tags: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  likes: number;
  favorites: number;
  comments: number;
  is_pinned: boolean;
  is_featured: boolean;
  topic_id?: number;
  collection_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  accepted_answer_id?: number;
  views: number;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: number;
  question_id: number;
  user_id: number;
  content: string;
  is_accepted: boolean;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  status: 'recruiting' | 'in_progress' | 'completed' | 'cancelled';
  team_size: number;
  current_members: number;
  progress: number;
  likes: number;
  favorites: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'owner' | 'member' | 'applicant';
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  description?: string;
  url: string;
  type: 'document' | 'link' | 'tool' | 'other';
  downloads: number;
  created_at: string;
}

export interface Comment {
  id: number;
  target_type: 'article' | 'question' | 'answer' | 'project';
  target_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  likes: number;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: number;
  user_id: number;
  target_type: 'article' | 'question' | 'answer' | 'project' | 'comment';
  target_id: number;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  target_type: 'article' | 'project';
  target_id: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  usage_count: number;
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  description?: string;
  cover?: string;
  article_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: number;
  title: string;
  description?: string;
  cover?: string;
  user_id: number;
  article_count: number;
  is_public: boolean;
  created_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
  condition: string;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'like' | 'comment' | 'answer' | 'follow' | 'system' | 'project';
  content: string;
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface PointLog {
  id: number;
  user_id: number;
  action: string;
  points: number;
  description: string;
  related_id?: number;
  related_type?: string;
  created_at: string;
}

export interface DailyCheckIn {
  id: number;
  user_id: number;
  check_in_date: string;
  created_at: string;
}

export const LEVEL_CONFIG = [
  { level: 1, name: '萌新开发者', minPoints: 0 },
  { level: 2, name: '初级开发者', minPoints: 100 },
  { level: 3, name: '中级开发者', minPoints: 500 },
  { level: 4, name: '高级开发者', minPoints: 2000 },
  { level: 5, name: '核心贡献者', minPoints: 5000 },
  { level: 6, name: '社区大佬', minPoints: 15000 },
];

export const POINT_RULES = {
  DAILY_LOGIN: 5,
  PUBLISH_ARTICLE: 20,
  PUBLISH_QUESTION: 10,
  ANSWER_ACCEPTED: 30,
  PUBLISH_PROJECT: 50,
  CONTENT_LIKED: 1,
  CONTENT_FAVORITED: 2,
  CONTENT_DELETED: -50,
  SPAM: -30,
  CHEAT: -999999,
};
