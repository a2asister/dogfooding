import { create } from 'zustand';
import type { ActivityBarView, BottomPanelView, ConsoleLog, Problem, Settings } from '../types';

interface UIState {
  activityBarView: ActivityBarView;
  bottomPanelView: BottomPanelView;
  isBottomPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  isCreateProjectOpen: boolean;
  isSettingsOpen: boolean;
  consoleLogs: ConsoleLog[];
  problems: Problem[];
  settings: Settings;
  searchQuery: string;
}

interface UIActions {
  setActivityBarView: (view: ActivityBarView) => void;
  setBottomPanelView: (view: BottomPanelView) => void;
  toggleBottomPanel: () => void;
  toggleCommandPalette: () => void;
  toggleCreateProject: () => void;
  toggleSettings: () => void;
  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
  clearConsole: () => void;
  addProblem: (problem: Omit<Problem, 'id'>) => void;
  clearProblems: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setSearchQuery: (query: string) => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  tabSize: 2,
  wordWrap: true,
  formatOnSave: true,
  autoSave: true,
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  activityBarView: 'files',
  bottomPanelView: 'console',
  isBottomPanelOpen: true,
  isCommandPaletteOpen: false,
  isCreateProjectOpen: false,
  isSettingsOpen: false,
  consoleLogs: [],
  problems: [],
  settings: defaultSettings,
  searchQuery: '',

  setActivityBarView: (view) => set({ activityBarView: view }),
  setBottomPanelView: (view) => set({ bottomPanelView: view }),
  toggleBottomPanel: () => set((state) => ({ isBottomPanelOpen: !state.isBottomPanelOpen })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleCreateProject: () => set((state) => ({ isCreateProjectOpen: !state.isCreateProjectOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  addConsoleLog: (log) =>
    set((state) => ({
      consoleLogs: [
        ...state.consoleLogs,
        {
          ...log,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        },
      ],
    })),

  clearConsole: () => set({ consoleLogs: [] }),

  addProblem: (problem) =>
    set((state) => ({
      problems: [
        ...state.problems,
        {
          ...problem,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    })),

  clearProblems: () => set({ problems: [] }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
