import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { SystemState, User, OperationLog } from '@/types';
import { mockUsers, generateOperationLogs } from '@/mock/data';

interface SystemStateSlice extends SystemState {
  currentUser: User | null;
  users: User[];
  operationLogs: OperationLog[];
  isLoggedIn: boolean;
  loginLoading: boolean;
  loginError: string | null;
}

const initialState: SystemStateSlice = {
  isOnline: true,
  lastUpdate: new Date().toISOString(),
  refreshInterval: 5000,
  isAutoRefresh: true,
  currentUser: mockUsers[0],
  users: mockUsers,
  operationLogs: generateOperationLogs(),
  isLoggedIn: true,
  loginLoading: false,
  loginError: null,
};

export const fetchOperationLogs = createAsyncThunk(
  'system/fetchOperationLogs',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateOperationLogs();
  }
);

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLastUpdate: (state, action: PayloadAction<string>) => {
      state.lastUpdate = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.isAutoRefresh = action.payload;
    },
    login: (state, action: PayloadAction<{ username: string; password: string }>) => {
      state.loginLoading = true;
      state.loginError = null;
      const user = state.users.find(
        (u) => u.username === action.payload.username && u.isActive
      );
      if (user) {
        state.currentUser = user;
        state.isLoggedIn = true;
        state.loginLoading = false;
      } else {
        state.loginError = '用户名或密码错误';
        state.loginLoading = false;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isLoggedIn = false;
    },
    addOperationLog: (
      state,
      action: PayloadAction<Omit<OperationLog, 'id' | 'createdAt'>>
    ) => {
      const maxId = Math.max(0, ...state.operationLogs.map((l) => l.id));
      const newLog: OperationLog = {
        ...action.payload,
        id: maxId + 1,
        createdAt: new Date().toISOString(),
      };
      state.operationLogs.unshift(newLog);
    },
    toggleUserActive: (state, action: PayloadAction<{ id: number; isActive: boolean }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) {
        user.isActive = action.payload.isActive;
      }
    },
    updateUserPermissions: (
      state,
      action: PayloadAction<{ id: number; permissions: string[] }>
    ) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) {
        user.permissions = action.payload.permissions;
      }
    },
    updateUserRole: (
      state,
      action: PayloadAction<{ id: number; role: User['role'] }>
    ) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) {
        user.role = action.payload.role;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperationLogs.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(fetchOperationLogs.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.operationLogs = action.payload;
      })
      .addCase(fetchOperationLogs.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.error.message || 'Failed to fetch operation logs';
      });
  },
});

export const {
  setOnline,
  setLastUpdate,
  setRefreshInterval,
  setAutoRefresh,
  login,
  logout,
  addOperationLog,
  toggleUserActive,
  updateUserPermissions,
  updateUserRole,
} = systemSlice.actions;

export default systemSlice.reducer;
