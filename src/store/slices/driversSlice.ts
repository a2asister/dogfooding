import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Driver, DriverStatus } from '@/types';
import { mockDrivers, generateDrivers } from '@/mock/data';

interface DriversState {
  list: Driver[];
  loading: boolean;
  error: string | null;
  selectedDriver: Driver | null;
  filters: {
    status?: DriverStatus;
    shift?: string;
    search?: string;
  };
}

const initialState: DriversState = {
  list: mockDrivers,
  loading: false,
  error: null,
  selectedDriver: null,
  filters: {},
};

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateDrivers();
  }
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    setSelectedDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },
    setFilters: (state, action: PayloadAction<DriversState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateDriverStatus: (
      state,
      action: PayloadAction<{ id: number; status: DriverStatus }>
    ) => {
      const driver = state.list.find((d) => d.id === action.payload.id);
      if (driver) {
        driver.status = action.payload.status;
      }
    },
    updateDriverShift: (
      state,
      action: PayloadAction<{ id: number; shift: string }>
    ) => {
      const driver = state.list.find((d) => d.id === action.payload.id);
      if (driver) {
        driver.shift = action.payload.shift;
      }
    },
    lockDriver: (
      state,
      action: PayloadAction<{ id: number; isLocked: boolean }>
    ) => {
      const driver = state.list.find((d) => d.id === action.payload.id);
      if (driver) {
        driver.isLocked = action.payload.isLocked;
      }
    },
    markDriverAbnormal: (
      state,
      action: PayloadAction<{ id: number; isAbnormal: boolean; reason?: string }>
    ) => {
      const driver = state.list.find((d) => d.id === action.payload.id);
      if (driver) {
        driver.isAbnormal = action.payload.isAbnormal;
        if (action.payload.reason) {
          driver.abnormalReason = action.payload.reason;
        }
      }
    },
    incrementDriverOrders: (
      state,
      action: PayloadAction<{ id: number; hours?: number }>
    ) => {
      const driver = state.list.find((d) => d.id === action.payload.id);
      if (driver) {
        driver.orders += 1;
        if (action.payload.hours) {
          driver.workingHours += action.payload.hours;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch drivers';
      });
  },
});

export const {
  setSelectedDriver,
  setFilters,
  updateDriverStatus,
  updateDriverShift,
  lockDriver,
  markDriverAbnormal,
  incrementDriverOrders,
} = driversSlice.actions;

export default driversSlice.reducer;
