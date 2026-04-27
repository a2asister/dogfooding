import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Vehicle, OperationalStatus, VehicleStatus } from '@/types';
import { mockVehicles, generateVehicles } from '@/mock/data';

interface VehiclesState {
  list: Vehicle[];
  loading: boolean;
  error: string | null;
  selectedVehicle: Vehicle | null;
  filters: {
    status?: VehicleStatus;
    operationalStatus?: OperationalStatus;
    area?: string;
    search?: string;
  };
}

const initialState: VehiclesState = {
  list: mockVehicles,
  loading: false,
  error: null,
  selectedVehicle: null,
  filters: {},
};

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateVehicles();
  }
);

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setFilters: (state, action: PayloadAction<VehiclesState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateVehicleStatus: (
      state,
      action: PayloadAction<{ id: number; status: VehicleStatus }>
    ) => {
      const vehicle = state.list.find((v) => v.id === action.payload.id);
      if (vehicle) {
        vehicle.status = action.payload.status;
      }
    },
    updateVehicleOperationalStatus: (
      state,
      action: PayloadAction<{ id: number; operationalStatus: OperationalStatus }>
    ) => {
      const vehicle = state.list.find((v) => v.id === action.payload.id);
      if (vehicle) {
        vehicle.operationalStatus = action.payload.operationalStatus;
      }
    },
    assignVehicleToArea: (
      state,
      action: PayloadAction<{ id: number; area: string }>
    ) => {
      const vehicle = state.list.find((v) => v.id === action.payload.id);
      if (vehicle) {
        vehicle.area = action.payload.area;
      }
    },
    markVehicleAbnormal: (
      state,
      action: PayloadAction<{ id: number; isAbnormal: boolean; reason?: string }>
    ) => {
      const vehicle = state.list.find((v) => v.id === action.payload.id);
      if (vehicle) {
        vehicle.isAbnormal = action.payload.isAbnormal;
        if (action.payload.reason) {
          vehicle.abnormalReason = action.payload.reason;
        }
      }
    },
    updateVehicleLocation: (
      state,
      action: PayloadAction<{ id: number; lat: number; lng: number }>
    ) => {
      const vehicle = state.list.find((v) => v.id === action.payload.id);
      if (vehicle) {
        vehicle.location = {
          lat: action.payload.lat,
          lng: action.payload.lng,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch vehicles';
      });
  },
});

export const {
  setSelectedVehicle,
  setFilters,
  updateVehicleStatus,
  updateVehicleOperationalStatus,
  assignVehicleToArea,
  markVehicleAbnormal,
  updateVehicleLocation,
} = vehiclesSlice.actions;

export default vehiclesSlice.reducer;
