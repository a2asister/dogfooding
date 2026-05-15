export type ThemeMode = 'light' | 'dark' | 'auto';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'system' | 'file' | 'app' | 'update' | 'security';
export type SearchCategory = 'all' | 'files' | 'folders' | 'apps' | 'settings';

export interface User {
  id: number;
  username: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  glassmorphism: {
    enabled: boolean;
    blur: number;
    opacity: number;
    saturation: number;
  };
  transparency: number;
}

export interface DisplayConfig {
  scale: number;
  fontFamily: string;
  animationsEnabled: boolean;
  iconSize: 'small' | 'medium' | 'large';
}

export interface DateTimeConfig {
  timeFormat: '12h' | '24h';
  dateFormat: string;
  showSeconds: boolean;
  showDate: boolean;
}

export interface PersonalizationConfig {
  accentColor: string;
  soundEffects: boolean;
  notificationsEnabled: boolean;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  type: 'folder' | 'file' | 'app';
}

export interface DesktopConfig {
  id: number;
  wallpaper: string;
  layout: DesktopIcon[];
  taskbarConfig: {
    showTime: boolean;
    position: 'bottom' | 'top';
    showSearch: boolean;
    showNotifications: boolean;
    autoHide: boolean;
  };
  startMenu: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  theme: ThemeConfig;
  display: DisplayConfig;
  dateTime: DateTimeConfig;
  personalization: PersonalizationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  actionData?: {
    actionType: string;
    payload: any;
  };
  createdAt: string;
  readAt?: string;
}

export interface SearchResult {
  id: string | number;
  name: string;
  type: string;
  category: SearchCategory;
  icon?: string;
  description?: string;
  path?: string;
  relevance: number;
}

export interface FileItem {
  id: number;
  name: string;
  content: string | null;
  type: 'folder' | 'file';
  parentId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  originalPath: string | null;
  mimeType: string | null;
  size: number;
}

export interface WindowState {
  id?: number;
  windowId: string;
  title: string;
  type: 'explorer' | 'editor' | 'calculator' | 'browser' | 'settings' | 'trash' | 'notifications';
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  zIndex?: number;
  data?: any;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppData {
  id: number;
  appType: 'notepad' | 'calculator' | 'browser';
  content: string | null;
  metadata: any;
  title: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export enum SortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TYPE = 'type',
  SIZE = 'size',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface BatchOperationResult {
  total: number;
  successCount: number;
  results: Array<{
    fileId: number;
    success: boolean;
    error?: string;
  }>;
}

export interface ApiError {
  success: boolean;
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  canRepair: boolean;
}