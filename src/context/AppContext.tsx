import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AnimationState, ViewState, AppSettings, SearchFilter, UserProgress } from '../types';
import { techNodes, timelineMarkers } from '../data/techNodes';
import { MIN_YEAR, MAX_YEAR, TOTAL_YEARS, TOTAL_DURATION } from '../utils/constants';

interface AppState {
  animation: AnimationState;
  view: ViewState;
  settings: AppSettings;
  searchFilter: SearchFilter;
  selectedNodeId: string | null;
  userProgress: Record<string, UserProgress>;
  isOffline: boolean;
}

type AppAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'SET_LOOPING'; payload: boolean }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'SET_ROTATION'; payload: number }
  | { type: 'RESET_VIEW' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_ANIMATION_QUALITY'; payload: 'low' | 'medium' | 'high' }
  | { type: 'SET_AUTOPLAY'; payload: boolean }
  | { type: 'SET_SHOW_LABELS'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_STATUSES'; payload: string[] }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'MARK_COMPLETED'; payload: string }
  | { type: 'VIEW_NODE'; payload: string }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  animation: {
    isPlaying: false,
    currentTime: 0,
    totalDuration: TOTAL_DURATION,
    playbackSpeed: 0.5,
    isLooping: false,
  },
  view: {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
  },
  settings: {
    animationQuality: 'high',
    autoplay: false,
    showLabels: true,
    theme: 'light',
  },
  searchFilter: {
    query: '',
    categories: [],
    statuses: [],
  },
  selectedNodeId: null,
  userProgress: {},
  isOffline: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, animation: { ...state.animation, isPlaying: action.payload } };
    case 'SET_CURRENT_TIME':
      return { ...state, animation: { ...state.animation, currentTime: action.payload } };
    case 'SET_PLAYBACK_SPEED':
      return { ...state, animation: { ...state.animation, playbackSpeed: action.payload } };
    case 'SET_LOOPING':
      return { ...state, animation: { ...state.animation, isLooping: action.payload } };
    case 'SET_ZOOM':
      return { ...state, view: { ...state.view, zoom: action.payload } };
    case 'SET_PAN':
      return { ...state, view: { ...state.view, panX: action.payload.x, panY: action.payload.y } };
    case 'SET_ROTATION':
      return { ...state, view: { ...state.view, rotation: action.payload } };
    case 'RESET_VIEW':
      return { ...state, view: { zoom: 1, panX: 0, panY: 0, rotation: 0 } };
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case 'SET_ANIMATION_QUALITY':
      return { ...state, settings: { ...state.settings, animationQuality: action.payload } };
    case 'SET_AUTOPLAY':
      return { ...state, settings: { ...state.settings, autoplay: action.payload } };
    case 'SET_SHOW_LABELS':
      return { ...state, settings: { ...state.settings, showLabels: action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchFilter: { ...state.searchFilter, query: action.payload } };
    case 'SET_CATEGORIES':
      return { ...state, searchFilter: { ...state.searchFilter, categories: action.payload as AppState['searchFilter']['categories'] } };
    case 'SET_STATUSES':
      return { ...state, searchFilter: { ...state.searchFilter, statuses: action.payload as AppState['searchFilter']['statuses'] } };
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload };
    case 'TOGGLE_BOOKMARK': {
      const progress = state.userProgress[action.payload] || {
        techNodeId: action.payload,
        isCompleted: false,
        isBookmarked: false,
        lastViewedAt: Date.now(),
        viewCount: 0,
      };
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.payload]: { ...progress, isBookmarked: !progress.isBookmarked },
        },
      };
    }
    case 'MARK_COMPLETED': {
      const progress = state.userProgress[action.payload] || {
        techNodeId: action.payload,
        isCompleted: false,
        isBookmarked: false,
        lastViewedAt: Date.now(),
        viewCount: 0,
      };
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.payload]: { ...progress, isCompleted: !progress.isCompleted },
        },
      };
    }
    case 'VIEW_NODE': {
      const progress = state.userProgress[action.payload] || {
        techNodeId: action.payload,
        isCompleted: false,
        isBookmarked: false,
        lastViewedAt: Date.now(),
        viewCount: 0,
      };
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.payload]: {
            ...progress,
            lastViewedAt: Date.now(),
            viewCount: progress.viewCount + 1,
          },
        },
      };
    }
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentYear: number;
  activeTechNodes: typeof techNodes;
  activeMarkers: typeof timelineMarkers;
  togglePlaying: () => void;
  jumpToYear: (year: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleLooping: () => void;
  resetView: () => void;
  toggleTheme: () => void;
  selectNode: (nodeId: string | null) => void;
  toggleBookmark: (nodeId: string) => void;
  markCompleted: (nodeId: string) => void;
  saveState: () => void;
  loadState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const currentYear = Math.round(
    MIN_YEAR + (state.animation.currentTime / state.animation.totalDuration) * TOTAL_YEARS
  );

  const activeTechNodes = techNodes.filter(node => {
    const startYear = parseInt(node.timelineStart);
    const endYear = node.timelineEnd ? parseInt(node.timelineEnd) : MAX_YEAR + 1;
    return currentYear >= startYear && currentYear < endYear;
  });

  const activeMarkers = timelineMarkers.filter(
    marker => parseInt(marker.date) === currentYear
  );

  const togglePlaying = useCallback(() => {
    if (!state.animation.isPlaying) {
      dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
    }
    dispatch({ type: 'SET_PLAYING', payload: !state.animation.isPlaying });
  }, [state.animation.isPlaying]);

  const jumpToYear = useCallback((year: number) => {
    const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    const time = ((clampedYear - MIN_YEAR) / TOTAL_YEARS) * state.animation.totalDuration;
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, [state.animation.totalDuration]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed });
  }, []);

  const toggleLooping = useCallback(() => {
    dispatch({ type: 'SET_LOOPING', payload: !state.animation.isLooping });
  }, [state.animation.isLooping]);

  const resetView = useCallback(() => {
    dispatch({ type: 'RESET_VIEW' });
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  }, [state.settings.theme]);

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
    if (nodeId) {
      dispatch({ type: 'VIEW_NODE', payload: nodeId });
    }
  }, []);

  const toggleBookmark = useCallback((nodeId: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: nodeId });
  }, []);

  const markCompleted = useCallback((nodeId: string) => {
    dispatch({ type: 'MARK_COMPLETED', payload: nodeId });
  }, []);

  const saveState = useCallback(() => {
    try {
      const stateToSave = {
        settings: state.settings,
        userProgress: state.userProgress,
        searchFilter: state.searchFilter,
      };
      localStorage.setItem('techEvolutionState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state.settings, state.userProgress, state.searchFilter]);

  const loadState = useCallback(() => {
    try {
      const saved = localStorage.getItem('techEvolutionState');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    currentYear,
    activeTechNodes,
    activeMarkers,
    togglePlaying,
    jumpToYear,
    setPlaybackSpeed,
    toggleLooping,
    resetView,
    toggleTheme,
    selectNode,
    toggleBookmark,
    markCompleted,
    saveState,
    loadState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
