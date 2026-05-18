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

export interface Comment {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  author: User;
  authorId: string;
  noteId: string;
  parentId?: string;
  rootId?: string;
  replyToUser?: User;
  replyToUserId?: string;
  replies?: Comment[];
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentParams {
  noteId: string;
  content: string;
  parentId?: string;
  replyToUserId?: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  noteCount: number;
  followCount: number;
  isHot: boolean;
  sort: number;
  category?: string;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  itemCount: number;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  noteId: string;
  note: Note;
  addedAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'favorite' | 'system';
  content: string;
  extra?: Record<string, any>;
  isRead: boolean;
  userId: string;
  fromUser?: User;
  fromUserId?: string;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  keyword: string;
  searchCount: number;
  createdAt: string;
}

export interface HotSearch {
  id: string;
  keyword: string;
  searchCount: number;
  rank: number;
  isHot: boolean;
}

export interface SearchResult {
  notes?: { list: Note[]; total: number };
  users?: { list: User[]; total: number };
  topics?: { list: Topic[]; total: number };
}

export interface Report {
  id: string;
  type: 'note' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description?: string;
  images?: string[];
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  handleResult?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistItem {
  id: string;
  blockedUser: User;
  createdAt: string;
}

export interface PrivacySettings {
  showFollowers: boolean;
  showFollowing: boolean;
  showFavorites: boolean;
  allowComment: boolean;
  allowPrivateMessage: boolean;
}

export interface NotificationSettings {
  like: boolean;
  comment: boolean;
  reply: boolean;
  follow: boolean;
  favorite: boolean;
  system: boolean;
}

export interface UserExtended extends User {
  background?: string;
  location?: string;
  gender?: string;
  birthday?: string;
  website?: string;
  privacySettings?: PrivacySettings;
  notificationSettings?: NotificationSettings;
}

export interface NoteStats {
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
  hotScore: number;
}

export interface UserNoteStats {
  totalNotes: number;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  shareCount: number;
}

export interface SensitiveCheckResult {
  hasSensitive: boolean;
  foundWords: string[];
  message: string;
}
