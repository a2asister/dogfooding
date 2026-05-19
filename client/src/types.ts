export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  points: number;
  level: number;
  role: string;
  status: string;
  created_at: string;
  hasCheckedIn?: boolean;
}

export interface Article {
  id: number;
  user_id: number;
  title: string;
  content: string;
  summary?: string | null;
  tags: string;
  status: string;
  views: number;
  likes: number;
  favorites: number;
  comments: number;
  is_pinned: number;
  is_featured: number;
  topic_id?: number | null;
  collection_id?: number | null;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
  is_liked?: number;
  is_favorited?: number;
}

export interface Question {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags: string;
  status: string;
  accepted_answer_id?: number | null;
  views: number;
  likes: number;
  comments: number;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
  answer_count?: number;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  question_id: number;
  user_id: number;
  content: string;
  is_accepted: number;
  likes: number;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
  is_liked?: number;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  status: string;
  team_size: number;
  current_members: number;
  progress: number;
  likes: number;
  favorites: number;
  views: number;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
  is_liked?: number;
  is_favorited?: number;
  members?: ProjectMember[];
  resources?: Resource[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  status: string;
  applied_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
}

export interface Resource {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  description?: string | null;
  url: string;
  type: string;
  downloads: number;
  created_at: string;
  username?: string;
}

export interface Comment {
  id: number;
  target_type: string;
  target_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  likes: number;
  status: string;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar?: string | null;
  level?: number;
  is_liked?: number;
  reply_count?: number;
  replies?: Comment[];
}

export interface Tag {
  id: number;
  name: string;
  description?: string | null;
  color: string;
  usage_count: number;
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  description?: string | null;
  cover?: string | null;
  article_count: number;
  is_active: number;
  created_at: string;
}

export interface Collection {
  id: number;
  title: string;
  description?: string | null;
  cover?: string | null;
  user_id: number;
  article_count: number;
  is_public: number;
  created_at: string;
  username?: string;
  avatar?: string | null;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string | null;
  condition: string;
  created_at: string;
  earned_at?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  content: string;
  related_id?: number | null;
  related_type?: string | null;
  is_read: number;
  created_at: string;
}

export interface LevelConfig {
  level: number;
  name: string;
  minPoints: number;
}
