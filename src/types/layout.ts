import type { ReactNode } from 'react';

export interface LayoutProps {
  sidebarContent?: ReactNode;
  editorContent?: ReactNode;
  terminalContent?: ReactNode;
  topBarExtra?: ReactNode;
}

export interface LayoutState {
  sidebarCollapsed: boolean;
  activePanel: string;
  sidebarWidth: number;
}

export interface ActivityItem {
  id: string;
  icon: ReactNode;
  tooltip: string;
}

export interface ActivityBarProps {
  items: ActivityItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export interface SidebarProps {
  title: string;
  collapsed: boolean;
  width: number;
  onToggle: () => void;
  children: ReactNode;
}

export interface TopBarProps {
  menuItems: string[];
  extraContent?: ReactNode;
}

export interface StatusBarItem {
  id: string;
  content: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface StatusBarProps {
  leftItems: StatusBarItem[];
  rightItems: StatusBarItem[];
}

export interface EditorAreaProps {
  children: ReactNode;
}
