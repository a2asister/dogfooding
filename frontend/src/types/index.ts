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
}

export interface WindowState {
  id: string;
  title: string;
  type: 'explorer' | 'editor';
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  data?: any;
}