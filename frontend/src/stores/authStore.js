import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (updates) => {
        const { user } = get();
        set({
          user: { ...user, ...updates },
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
