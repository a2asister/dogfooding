import { createRoot, createSignal, createEffect } from 'solid-js';
import type { User, AuthState } from '../types';
import { authApi } from '../services/api';

function createAuthStore() {
  const [authState, setAuthState] = createSignal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  createEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setAuthState({ user, token, isAuthenticated: true });
      } catch {
        logout();
      }
    }
  });

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    const { token, user } = response;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, token, isAuthenticated: true });

    return { user, token };
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authApi.register(username, email, password);
    const { token, user } = response;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ user, token, isAuthenticated: true });

    return { user, token };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  const checkAuth = async () => {
    try {
      const response = await authApi.getMe();
      const { user } = response;
      const token = localStorage.getItem('token');

      if (user && token) {
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({ user, token, isAuthenticated: true });
        return true;
      }
    } catch {
      logout();
    }
    return false;
  };

  return {
    authState,
    login,
    register,
    logout,
    checkAuth,
  };
}

export default createRoot(createAuthStore);
