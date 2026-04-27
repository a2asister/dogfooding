export type TechCategory =
  | 'vanilla'
  | 'library'
  | 'framework'
  | 'build-tool'
  | 'other';

export type TechStatus =
  | 'emerging'
  | 'popular'
  | 'maintaining'
  | 'deprecated';

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  comparisonCode?: string;
  comparisonTitle?: string;
}

export interface VersionInfo {
  version: string;
  releaseDate: string;
  features: string[];
  breakingChanges?: string[];
  codeSnippets?: CodeSnippet[];
}

export interface TechNode {
  id: string;
  name: string;
  displayName: string;
  category: TechCategory;
  description: string;
  longDescription: string;
  logo?: string;
  color: string;
  timelineStart: string;
  timelineEnd?: string;
  versions: VersionInfo[];
  keyApis: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
  relatedTechIds: string[];
  influencedBy?: string[];
  influenced?: string[];
  status: TechStatus;
  iconEmoji: string;
}

export interface TimelineMarker {
  id: string;
  date: string;
  label: string;
  techNodeIds: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  playbackSpeed: number;
  isLooping: boolean;
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
}

export interface UserProgress {
  techNodeId: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  lastViewedAt: number;
  viewCount: number;
}

export interface AppSettings {
  animationQuality: 'low' | 'medium' | 'high';
  autoplay: boolean;
  showLabels: boolean;
  theme: 'light' | 'dark';
}

export interface SearchFilter {
  query: string;
  categories: TechCategory[];
  statuses: TechStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NodeConnection {
  sourceId: string;
  targetId: string;
  type: 'dependency' | 'influence' | 'competition' | 'evolution';
  strength: number;
}
