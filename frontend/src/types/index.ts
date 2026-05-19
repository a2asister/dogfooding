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

export interface UserTag {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  color?: string;
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserTagRelation {
  id: string;
  userId: string;
  tagId: string;
  tag: UserTag;
  weight: number;
  source: string;
  createdAt: string;
}

export interface UserBehavior {
  id: string;
  userId: string;
  behaviorType: string;
  targetType: string;
  targetId: string;
  noteId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserProfile {
  user: User;
  tags: UserTagRelation[];
  behaviorStats: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalSearches: number;
    activeDays: number;
  };
  topInterests: string[];
}

export interface RecommendNote extends Note {
  recommendScore: number;
  matchTags: string[];
}

export interface RecommendResult {
  list: RecommendNote[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReviewTask {
  id: string;
  type: 'note' | 'comment' | 'user';
  targetId: string;
  content: string;
  targetUserId: string;
  targetUser?: User;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  level: 'low' | 'medium' | 'high';
  aiResult?: {
    passed: boolean;
    riskLevel: string;
    categories: string[];
    score: number;
  };
  reviewerId?: string;
  reviewer?: User;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ReviewTaskResult {
  list: ReviewTask[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ViolationDetectionResult {
  passed: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  categories: string[];
  details: { type: string; description: string }[];
  score: number;
}

export interface ContentRestriction {
  id: string;
  noteId: string;
  note?: Note;
  type: string;
  level: string;
  reasons: any[];
  flowMultiplier: number;
  operatorId?: string;
  operator?: User;
  remark?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserRestriction {
  id: string;
  userId: string;
  user?: User;
  type: 'mute' | 'flow_limit' | 'ban' | 'warning';
  scope: 'comment' | 'post' | 'all';
  reason: string;
  operatorId?: string;
  operator?: User;
  isActive: boolean;
  isPermanent: boolean;
  expiresAt?: string;
  createdAt: string;
  liftedAt?: string;
  liftedReason?: string;
}

export interface BehaviorRisk {
  id: string;
  type: string;
  level: string;
  status: string;
  userId?: string;
  user?: User;
  noteId?: string;
  note?: Note;
  commentId?: string;
  evidence: Record<string, any>;
  confidence: number;
  reviewerId?: string;
  reviewer?: User;
  reviewNote?: string;
  reviewedAt?: string;
  processedAt?: string;
  detectedAt: string;
}

export interface AccountRisk {
  id: string;
  type: string;
  level: string;
  status: string;
  userId: string;
  user: User;
  actionTaken: string;
  evidence: Record<string, any>;
  confidence: number;
  loginDetails?: Record<string, any>;
  batchDetails?: Record<string, any>;
  reviewerId?: string;
  reviewer?: User;
  reviewNote?: string;
  reviewedAt?: string;
  processedAt?: string;
  detectedAt: string;
}

export interface LoginLog {
  id: string;
  userId?: string;
  user?: User;
  username?: string;
  phone?: string;
  status: 'success' | 'failed';
  ip?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  failReason?: string;
  isNewDevice: boolean;
  isNewLocation: boolean;
  createdAt: string;
}

export interface RegisterLog {
  id: string;
  userId?: string;
  user?: User;
  username?: string;
  phone?: string;
  status: 'success' | 'failed';
  ip?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  failReason?: string;
  isSuspicious: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  position: 'home_top' | 'home_middle' | 'topic_top';
  type: 'note' | 'topic' | 'url';
  targetId?: string;
  targetUrl?: string;
  description?: string;
  sort: number;
  isActive: boolean;
  clickCount: number;
  startTime?: string;
  endTime?: string;
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotRank {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  noteId: string;
  note?: Note;
  score: number;
  baseScore: number;
  boostValue: number;
  isPinned: boolean;
  rank: number;
  createdAt: string;
}

export interface FlowSupport {
  id: string;
  noteId: string;
  note?: Note;
  type: 'cold_start' | 'manual' | 'event';
  boostMultiplier: number;
  reason?: string;
  targetViews?: number;
  currentViews: number;
  operatorId?: string;
  operator?: User;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatorData {
  id: string;
  userId: string;
  date: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
  totalShares: number;
  newFollowers: number;
  newNotes: number;
  engagementRate: number;
  noteStats: Array<{
    noteId: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  }>;
  fanDemographics: {
    gender: Record<string, number>;
    ageRange: Record<string, number>;
    location: Record<string, number>;
    interests: Record<string, number>;
  };
  createdAt: string;
}

export interface CreatorOverview {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
  totalFollowers: number;
  totalNotes: number;
  engagementRate: number;
  viewsTrend: number[];
  followersTrend: number[];
  topNotes: Note[];
}

export interface CreatorVerification {
  id: string;
  userId: string;
  user?: User;
  type: 'personal' | 'organization' | 'expert' | 'celebrity';
  realName: string;
  idCard?: string;
  organizationName?: string;
  organizationLicense?: string;
  materials?: Array<{ type: string; url: string; description: string }>;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  reviewerId?: string;
  reviewer?: User;
  reviewNote?: string;
  verifiedAt?: string;
  expiresAt?: string;
  level: number;
  badgeText?: string;
  badgeIcon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  path?: string;
  icon?: string;
  sort: number;
  parentId?: string;
  children?: Permission[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'locked';
  isSuperAdmin: boolean;
  loginCount: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}
