import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ReportData, Passenger } from '@/types';
import { mockReportData, generateReportData, mockPassengers } from '@/mock/data';

interface ReportState {
  data: ReportData;
  passengers: Passenger[];
  loading: boolean;
  error: string | null;
  selectedPeriod: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  selectedPassenger: Passenger | null;
  filters: {
    search?: string;
    hasComplaints?: boolean;
  };
}

const initialState: ReportState = {
  data: mockReportData,
  passengers: mockPassengers,
  loading: false,
  error: null,
  selectedPeriod: 'today',
  dateRange: {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  selectedPassenger: null,
  filters: {},
};

export const fetchReportData = createAsyncThunk(
  'report/fetchReportData',
  async (_params: { period?: string; startDate?: string; endDate?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateReportData();
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setSelectedPeriod: (state, action: PayloadAction<ReportState['selectedPeriod']>) => {
      state.selectedPeriod = action.payload;
    },
    setDateRange: (state, action: PayloadAction<ReportState['dateRange']>) => {
      state.dateRange = action.payload;
    },
    setSelectedPassenger: (state, action: PayloadAction<Passenger | null>) => {
      state.selectedPassenger = action.payload;
    },
    setFilters: (state, action: PayloadAction<ReportState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateReportData: (state, action: PayloadAction<ReportData>) => {
      state.data = action.payload;
    },
    updatePassengers: (state, action: PayloadAction<Passenger[]>) => {
      state.passengers = action.payload;
    },
    addPassenger: (state, action: PayloadAction<Passenger>) => {
      state.passengers.push(action.payload);
    },
    updatePassenger: (state, action: PayloadAction<Passenger>) => {
      const index = state.passengers.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.passengers[index] = action.payload;
      }
    },
    lockPassengerOrder: (state, action: PayloadAction<{ passengerId: number; isLocked: boolean }>) => {
      const passenger = state.passengers.find((p) => p.id === action.payload.passengerId);
      if (passenger) {
        passenger.hasComplaints = action.payload.isLocked;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch report data';
      });
  },
});

export const {
  setSelectedPeriod,
  setDateRange,
  setSelectedPassenger,
  setFilters,
  updateReportData,
  updatePassengers,
  addPassenger,
  updatePassenger,
  lockPassengerOrder,
} = reportSlice.actions;

export default reportSlice.reducer;
