import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  currentUser: User | null;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => storage.getAuth());

  useEffect(() => {
    const currentAuth = storage.getAuth();
    setAuth(currentAuth);
  }, []);

  const login = useCallback((username: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const userWithPassword = storage.getUserByUsernameWithPassword(username);
      if (userWithPassword && userWithPassword.password === password && userWithPassword.isActive) {
        const safeUser: User = {
          ...userWithPassword,
          password: '',
        };
        const authState: AuthState = {
          isAuthenticated: true,
          user: safeUser,
        };
        storage.setAuth(authState);
        setAuth(authState);
        
        storage.addLog({
          userId: safeUser.id,
          action: '登录',
          module: '认证',
          description: `用户 ${safeUser.name} 登录系统`,
          details: { username: safeUser.username },
        });
        
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }, []);

  const logout = useCallback(() => {
    if (auth.user) {
      storage.addLog({
        userId: auth.user.id,
        action: '登出',
        module: '认证',
        description: `用户 ${auth.user.name} 登出系统`,
        details: { username: auth.user.username },
      });
    }
    storage.clearAuth();
    setAuth({ isAuthenticated: false, user: null });
  }, [auth.user]);

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    if (!auth.user) return;
    const updatedUser = storage.updateUser(auth.user.id, updates);
    if (updatedUser) {
      const newAuth: AuthState = {
        isAuthenticated: true,
        user: updatedUser,
      };
      storage.setAuth(newAuth);
      setAuth(newAuth);
    }
  }, [auth.user]);

  const value: AuthContextType = {
    ...auth,
    login,
    logout,
    isAdmin: auth.user?.role === UserRole.ADMIN,
    currentUser: auth.user,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
