import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/services/auth';
import type { AuthState, User, LoginCredentials, LoginResult } from '@/types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
};

export const login = createAsyncThunk<
  LoginResult,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || '登录失败');
  } catch (error: unknown) {
    return rejectWithValue(
      error instanceof Error ? error.message : '登录失败'
    );
  }
});

export const fetchProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getProfile();
    if (response.success && response.data) {
      return response.data;
    }
    return rejectWithValue(response.message || '获取用户信息失败');
  } catch (error: unknown) {
    return rejectWithValue(
      error instanceof Error ? error.message : '获取用户信息失败'
    );
  }
});

export const logout = createAsyncThunk<void, void>('auth/logout', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user as unknown as User;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem(
          'user',
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearAuth, setCredentials } = authSlice.actions;
export default authSlice.reducer;
