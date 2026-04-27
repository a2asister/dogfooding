import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Alert, AlertLevel } from '@/types';
import { mockAlerts, generateAlerts } from '@/mock/data';

interface AlertsState {
  list: Alert[];
  loading: boolean;
  error: string | null;
  selectedAlert: Alert | null;
  filters: {
    level?: AlertLevel;
    type?: string;
    isRead?: boolean;
    isHandled?: boolean;
  };
  unreadCount: number;
}

const initialState: AlertsState = {
  list: mockAlerts,
  loading: false,
  error: null,
  selectedAlert: null,
  filters: {},
  unreadCount: mockAlerts.filter((a) => !a.isRead).length,
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateAlerts();
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setSelectedAlert: (state, action: PayloadAction<Alert | null>) => {
      state.selectedAlert = action.payload;
    },
    setFilters: (state, action: PayloadAction<AlertsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const alert = state.list.find((a) => a.id === action.payload);
      if (alert && !alert.isRead) {
        alert.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach((a) => {
        a.isRead = true;
      });
      state.unreadCount = 0;
    },
    markAsHandled: (
      state,
      action: PayloadAction<{ id: number; handledBy: string }>
    ) => {
      const alert = state.list.find((a) => a.id === action.payload.id);
      if (alert) {
        alert.isHandled = true;
        alert.handledBy = action.payload.handledBy;
        alert.handledAt = new Date().toISOString();
      }
    },
    addAlert: (state, action: PayloadAction<Omit<Alert, 'id' | 'createdAt' | 'isRead' | 'isHandled'>>) => {
      const maxId = Math.max(0, ...state.list.map((a) => a.id));
      const newAlert: Alert = {
        ...action.payload,
        id: maxId + 1,
        createdAt: new Date().toISOString(),
        isRead: false,
        isHandled: false,
      };
      state.list.unshift(newAlert);
      state.unreadCount += 1;
    },
    setAlertLevel: (state, action: PayloadAction<{ id: number; level: AlertLevel }>) => {
      const alert = state.list.find((a) => a.id === action.payload.id);
      if (alert) {
        alert.level = action.payload.level;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter((a) => !a.isRead).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch alerts';
      });
  },
});

export const {
  setSelectedAlert,
  setFilters,
  markAsRead,
  markAllAsRead,
  markAsHandled,
  addAlert,
  setAlertLevel,
} = alertsSlice.actions;

export default alertsSlice.reducer;
