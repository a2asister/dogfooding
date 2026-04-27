import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Trip, TripStatus, TripEvent } from '@/types';
import { mockTrips, generateTrips } from '@/mock/data';

interface TripsState {
  list: Trip[];
  loading: boolean;
  error: string | null;
  selectedTrip: Trip | null;
  filters: {
    status?: TripStatus;
    search?: string;
  };
}

const initialState: TripsState = {
  list: mockTrips,
  loading: false,
  error: null,
  selectedTrip: null,
  filters: {},
};

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateTrips();
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setSelectedTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },
    setFilters: (state, action: PayloadAction<TripsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateTripStatus: (
      state,
      action: PayloadAction<{ id: number; status: TripStatus }>
    ) => {
      const trip = state.list.find((t) => t.id === action.payload.id);
      if (trip) {
        trip.status = action.payload.status;
      }
    },
    updateTripLocation: (
      state,
      action: PayloadAction<{ id: number; lat: number; lng: number; speed: number }>
    ) => {
      const trip = state.list.find((t) => t.id === action.payload.id);
      if (trip) {
        trip.currentLocation = {
          lat: action.payload.lat,
          lng: action.payload.lng,
        };
        trip.currentSpeed = action.payload.speed;
      }
    },
    markTripAbnormal: (
      state,
      action: PayloadAction<{ id: number; isAbnormal: boolean; reason?: string }>
    ) => {
      const trip = state.list.find((t) => t.id === action.payload.id);
      if (trip) {
        trip.isAbnormal = action.payload.isAbnormal;
        if (action.payload.reason) {
          trip.abnormalReason = action.payload.reason;
        }
      }
    },
    addTripEvent: (
      state,
      action: PayloadAction<{ tripId: number; event: Omit<TripEvent, 'id'> }>
    ) => {
      const trip = state.list.find((t) => t.id === action.payload.tripId);
      if (trip) {
        const maxId = Math.max(0, ...trip.events.map((e) => e.id));
        trip.events.push({
          ...action.payload.event,
          id: maxId + 1,
        });
      }
    },
    updateTrafficStatus: (
      state,
      action: PayloadAction<{ id: number; status: Trip['trafficStatus'] }>
    ) => {
      const trip = state.list.find((t) => t.id === action.payload.id);
      if (trip) {
        trip.trafficStatus = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trips';
      });
  },
});

export const {
  setSelectedTrip,
  setFilters,
  updateTripStatus,
  updateTripLocation,
  markTripAbnormal,
  addTripEvent,
  updateTrafficStatus,
} = tripsSlice.actions;

export default tripsSlice.reducer;
