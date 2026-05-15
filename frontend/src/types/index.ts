export interface User {
  id: number;
  username: string;
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
  };
  startMenu: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
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
  type: 'explorer' | 'editor' | 'calculator' | 'browser' | 'settings' | 'trash';
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