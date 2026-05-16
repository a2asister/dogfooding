export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content: string;
  language: Language;
  parentId: string | null;
  isExpanded?: boolean;
}

export interface ProjectState {
  files: FileItem[];
  activeFileId: string | null;
  isDirty: boolean;
  lastSaved: Date | null;
  projectType: ProjectType;
}

export type Language = 'html' | 'css' | 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'json';

export type ProjectType = 'vanilla' | 'react' | 'vue' | 'vite';

export type ActivityBarView = 'files' | 'search' | 'settings' | 'extensions';

export type BottomPanelView = 'console' | 'problems' | 'terminal' | 'output';

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
  timestamp: Date;
}

export interface Problem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
}

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  handler: () => void;
}

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
}

export interface NPMPackage {
  name: string;
  version: string;
  description?: string;
  installed?: boolean;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  formatOnSave: boolean;
  autoSave: boolean;
}

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}
