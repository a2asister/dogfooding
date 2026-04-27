import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DispatchConfig, Area, DispatchRule, PriorityRule, SchedulingStrategy, AlertParameter, CapacityThreshold } from '@/types';
import { mockDispatchConfig } from '@/mock/data';

interface ConfigState {
  data: DispatchConfig;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

const initialState: ConfigState = {
  data: mockDispatchConfig,
  loading: false,
  error: null,
  isDirty: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    updateAreas: (state, action: PayloadAction<Area[]>) => {
      state.data.areas = action.payload;
      state.isDirty = true;
    },
    addArea: (state, action: PayloadAction<Omit<Area, 'id'>>) => {
      const maxId = Math.max(0, ...state.data.areas.map((a) => a.id));
      state.data.areas.push({
        ...action.payload,
        id: maxId + 1,
      });
      state.isDirty = true;
    },
    updateArea: (state, action: PayloadAction<Area>) => {
      const index = state.data.areas.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.data.areas[index] = action.payload;
        state.isDirty = true;
      }
    },
    deleteArea: (state, action: PayloadAction<number>) => {
      state.data.areas = state.data.areas.filter((a) => a.id !== action.payload);
      state.isDirty = true;
    },
    updateDispatchRules: (state, action: PayloadAction<DispatchRule[]>) => {
      state.data.dispatchRules = action.payload;
      state.isDirty = true;
    },
    updatePriorityRules: (state, action: PayloadAction<PriorityRule[]>) => {
      state.data.priorityRules = action.payload;
      state.isDirty = true;
    },
    updateCapacityThresholds: (state, action: PayloadAction<CapacityThreshold>) => {
      state.data.capacityThresholds = action.payload;
      state.isDirty = true;
    },
    updateAlertParameters: (state, action: PayloadAction<AlertParameter[]>) => {
      state.data.alertParameters = action.payload;
      state.isDirty = true;
    },
    updateSchedulingStrategies: (state, action: PayloadAction<SchedulingStrategy[]>) => {
      state.data.schedulingStrategies = action.payload;
      state.isDirty = true;
    },
    toggleDispatchRule: (state, action: PayloadAction<{ id: number; isActive: boolean }>) => {
      const rule = state.data.dispatchRules.find((r) => r.id === action.payload.id);
      if (rule) {
        rule.isActive = action.payload.isActive;
        state.isDirty = true;
      }
    },
    togglePriorityRule: (state, action: PayloadAction<{ id: number; isActive: boolean }>) => {
      const rule = state.data.priorityRules.find((r) => r.id === action.payload.id);
      if (rule) {
        rule.isActive = action.payload.isActive;
        state.isDirty = true;
      }
    },
    toggleSchedulingStrategy: (state, action: PayloadAction<{ id: number; isActive: boolean }>) => {
      const strategy = state.data.schedulingStrategies.find((s) => s.id === action.payload.id);
      if (strategy) {
        strategy.isActive = action.payload.isActive;
        state.isDirty = true;
      }
    },
    toggleAlertParameter: (state, action: PayloadAction<{ id: number; isEnabled: boolean }>) => {
      const param = state.data.alertParameters.find((p) => p.id === action.payload.id);
      if (param) {
        param.isEnabled = action.payload.isEnabled;
        state.isDirty = true;
      }
    },
    resetConfig: (state) => {
      state.data = mockDispatchConfig;
      state.isDirty = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setDirty,
  updateAreas,
  addArea,
  updateArea,
  deleteArea,
  updateDispatchRules,
  updatePriorityRules,
  updateCapacityThresholds,
  updateAlertParameters,
  updateSchedulingStrategies,
  toggleDispatchRule,
  togglePriorityRule,
  toggleSchedulingStrategy,
  toggleAlertParameter,
  resetConfig,
} = configSlice.actions;

export default configSlice.reducer;
