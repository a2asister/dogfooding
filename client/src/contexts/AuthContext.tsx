import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, realName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setToken(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: newToken, user: newUser } = response.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const register = async (username: string, email: string, password: string, realName: string) => {
    const response = await api.post('/auth/register', { username, email, password, realName });
    const { token: newToken, user: newUser } = response.data;
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
