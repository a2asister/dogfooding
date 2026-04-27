import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Order, OrderStatus, OrderPriority } from '@/types';
import { mockOrders, generateOrders } from '@/mock/data';

interface OrdersState {
  list: Order[];
  loading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  filters: {
    status?: OrderStatus;
    priority?: OrderPriority;
    area?: string;
    search?: string;
    isUrgent?: boolean;
    isTimeout?: boolean;
  };
}

const initialState: OrdersState = {
  list: mockOrders,
  loading: false,
  error: null,
  selectedOrder: null,
  filters: {},
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateOrders();
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setFilters: (state, action: PayloadAction<OrdersState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: number; status: OrderStatus; timestamp?: string }>
    ) => {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        const now = new Date().toISOString();
        if (action.payload.status === 'accepted') {
          order.acceptedAt = now;
        } else if (action.payload.status === 'completed') {
          order.completedAt = now;
        } else if (action.payload.status === 'cancelled') {
          order.cancelledAt = now;
        }
      }
    },
    assignOrder: (
      state,
      action: PayloadAction<{ id: number; vehicleId: number; driverId: number }>
    ) => {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = 'assigned';
        order.assignedVehicleId = action.payload.vehicleId;
        order.assignedDriverId = action.payload.driverId;
      }
    },
    reassignOrder: (
      state,
      action: PayloadAction<{ id: number; vehicleId: number; driverId: number }>
    ) => {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.assignedVehicleId = action.payload.vehicleId;
        order.assignedDriverId = action.payload.driverId;
      }
    },
    setOrderUrgent: (
      state,
      action: PayloadAction<{ id: number; isUrgent: boolean }>
    ) => {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.isUrgent = action.payload.isUrgent;
        order.priority = action.payload.isUrgent ? 'high' : order.priority;
      }
    },
    setOrderTimeout: (
      state,
      action: PayloadAction<{ id: number; isTimeout: boolean; minutes?: number }>
    ) => {
      const order = state.list.find((o) => o.id === action.payload.id);
      if (order) {
        order.isTimeout = action.payload.isTimeout;
        if (action.payload.minutes) {
          order.timeoutMinutes = action.payload.minutes;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });
  },
});

export const {
  setSelectedOrder,
  setFilters,
  updateOrderStatus,
  assignOrder,
  reassignOrder,
  setOrderUrgent,
  setOrderTimeout,
} = ordersSlice.actions;

export default ordersSlice.reducer;
