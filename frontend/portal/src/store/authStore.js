import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      subsystems: [],
      
      login: (token, user) => {
        set({ token, user });
      },
      
      logout: () => {
        set({ token: null, user: null, subsystems: [] });
      },
      
      setSubsystems: (subsystems) => {
        set({ subsystems });
      },
      
      hasPermission: (permission) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        
        return user.permissions.some(p => {
          if (p === '*') return true;
          if (p.endsWith(':*')) {
            const prefix = p.slice(0, -1);
            return permission.startsWith(prefix);
          }
          return p === permission;
        });
      },
      
      canAccessSubsystem: (subsystemId) => {
        const user = get().user;
        if (!user || !user.subsystems) return false;
        return user.subsystems.includes(subsystemId);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export const useIsAuthenticated = () => {
  const { token, user } = useAuthStore();
  return !!token && !!user;
};

export default useAuthStore;
