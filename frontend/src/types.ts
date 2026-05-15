export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  EXPIRED = 'expired',
}

export enum AnnouncementPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  isPinned: boolean;
  expireAt?: string;
  viewCount: number;
  readByUsers: string[];
  publishedBy?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
}
