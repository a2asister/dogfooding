import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  FloodData, 
  Warning, 
  HistoricalRecord, 
  DamParams, 
  SimulationParams, 
  AppMode,
  CameraView 
} from '@/types';

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  currentData: FloodData | null;
  setCurrentData: (data: FloodData | null) => void;
  updateData: (partial: Partial<FloodData>) => void;
  
  warnings: Warning[];
  addWarning: (warning: Omit<Warning, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeWarning: (id: string) => void;
  clearWarnings: () => void;
  
  historicalRecords: HistoricalRecord[];
  setHistoricalRecords: (records: HistoricalRecord[]) => void;
  selectedHistoryId: string | null;
  setSelectedHistoryId: (id: string | null) => void;
  historyPlaybackIndex: number;
  setHistoryPlaybackIndex: (index: number) => void;
  isPlayingHistory: boolean;
  setIsPlayingHistory: (playing: boolean) => void;
  
  damParams: DamParams;
  setDamParams: (params: Partial<DamParams>) => void;
  
  simulationParams: SimulationParams;
  setSimulationParams: (params: Partial<SimulationParams>) => void;
  
  cameraView: CameraView['type'];
  setCameraView: (view: CameraView['type']) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  lastUpdateTime: number;
  setLastUpdateTime: (time: number) => void;
  
  ui: {
    sidebarOpen: boolean;
    infoPanelOpen: boolean;
    dataPanelOpen: boolean;
    warningPanelOpen: boolean;
  };
  toggleSidebar: () => void;
  toggleInfoPanel: () => void;
  toggleDataPanel: () => void;
  toggleWarningPanel: () => void;
}

export const DAM_DEFAULT_PARAMS: DamParams = {
  height: 181,
  crestElevation: 185,
  totalLength: 2335,
  totalDischargeHoles: 77,
  designDischargeCapacity: 71200,
  maxDischargeCapacity: 124300,
  normalPoolLevel: 175,
  floodLimitLevel: 145,
};

const initialState: Pick<AppState, 'ui' | 'damParams' | 'simulationParams'> = {
  ui: {
    sidebarOpen: true,
    infoPanelOpen: false,
    dataPanelOpen: true,
    warningPanelOpen: false,
  },
  damParams: DAM_DEFAULT_PARAMS,
  simulationParams: {
    enabled: false,
    customOpenHoles: [],
    customDischargeFlow: 0,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      mode: 'real-time',
      setMode: (mode) => set({ mode }),
      
      currentData: null,
      setCurrentData: (data) => set({ currentData: data }),
      updateData: (partial) => set((state) => ({
        currentData: state.currentData ? { ...state.currentData, ...partial } : null
      })),
      
      warnings: [],
      addWarning: (warning) => set((state) => ({
        warnings: [...state.warnings, {
          ...warning,
          id: `warning-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          acknowledged: false,
        }]
      })),
      acknowledgeWarning: (id) => set((state) => ({
        warnings: state.warnings.map(w => w.id === id ? { ...w, acknowledged: true } : w)
      })),
      clearWarnings: () => set({ warnings: [] }),
      
      historicalRecords: [],
      setHistoricalRecords: (records) => set({ historicalRecords: records }),
      selectedHistoryId: null,
      setSelectedHistoryId: (id) => set({ selectedHistoryId: id }),
      historyPlaybackIndex: 0,
      setHistoryPlaybackIndex: (index) => set({ historyPlaybackIndex: index }),
      isPlayingHistory: false,
      setIsPlayingHistory: (playing) => set({ isPlayingHistory: playing }),
      
      setDamParams: (params) => set((state) => ({
        damParams: { ...state.damParams, ...params }
      })),
      
      setSimulationParams: (params) => set((state) => ({
        simulationParams: { ...state.simulationParams, ...params }
      })),
      
      cameraView: 'front',
      setCameraView: (view) => set({ cameraView: view }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      lastUpdateTime: 0,
      setLastUpdateTime: (time) => set({ lastUpdateTime: time }),
      
      toggleSidebar: () => set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      })),
      toggleInfoPanel: () => set((state) => ({
        ui: { ...state.ui, infoPanelOpen: !state.ui.infoPanelOpen }
      })),
      toggleDataPanel: () => set((state) => ({
        ui: { ...state.ui, dataPanelOpen: !state.ui.dataPanelOpen }
      })),
      toggleWarningPanel: () => set((state) => ({
        ui: { ...state.ui, warningPanelOpen: !state.ui.warningPanelOpen }
      })),
    }),
    {
      name: 'three-gorges-dam-storage',
      partialize: (state) => ({
        ui: state.ui,
        damParams: state.damParams,
      }),
    }
  )
);
