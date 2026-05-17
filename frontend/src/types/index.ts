export interface User {
  id: string;
  phone?: string;
  username?: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  role: 'visitor' | 'user' | 'admin';
  isActive: boolean;
  followerCount: number;
  followingCount: number;
  noteCount: number;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images?: string[];
  location?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'taken_down';
  permission: 'public' | 'private' | 'followers_only';
  likeCount: number;
  favoriteCount: number;
  shareCount: number;
  viewCount: number;
  rejectReason?: string;
  topics?: string[];
  author: User;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginParams {
  phone?: string;
  username?: string;
  password: string;
}

export interface PhoneLoginParams {
  phone: string;
  code: string;
}

export interface RegisterParams {
  phone?: string;
  username?: string;
  password: string;
  nickname?: string;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  images?: string[];
  location?: string;
  topics?: string[];
  permission: 'public' | 'private' | 'followers_only';
  publish: boolean;
}
