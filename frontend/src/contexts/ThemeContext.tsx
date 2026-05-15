import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfig, DesktopConfig } from '../types';
import { desktopApi } from '../services/api';

interface ThemeContextType {
  theme: ThemeConfig;
  isDark: boolean;
  updateTheme: (newTheme: Partial<ThemeConfig>) => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleGlassmorphism: () => Promise<void>;
  applyThemeStyles: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'dark',
  primaryColor: '#0078d7',
  glassmorphism: {
    enabled: true,
    blur: 20,
    opacity: 0.85,
    saturation: 1.2,
  },
  transparency: 0.85,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialConfig?: DesktopConfig | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialConfig }) => {
  const [theme, setTheme] = useState<ThemeConfig>(initialConfig?.theme || defaultTheme);

  useEffect(() => {
    if (initialConfig?.theme) {
      setTheme(initialConfig.theme);
    }
  }, [initialConfig]);

  useEffect(() => {
    applyThemeStyles();
  }, [theme]);

  const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const applyThemeStyles = () => {
    const root = document.documentElement;
    const dark = isDark;

    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');

    root.style.setProperty('--bg-primary', dark ? '#0a0a0a' : '#ffffff');
    root.style.setProperty('--bg-secondary', dark ? '#1a1a1a' : '#f3f3f3');
    root.style.setProperty('--text-primary', dark ? '#ffffff' : '#000000');
    root.style.setProperty('--text-secondary', dark ? '#cccccc' : '#666666');
    root.style.setProperty('--accent-color', theme.primaryColor);
    root.style.setProperty('--border-color', dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

    if (theme.glassmorphism.enabled) {
      root.style.setProperty('--glass-blur', `${theme.glassmorphism.blur}px`);
      root.style.setProperty('--glass-opacity', String(theme.glassmorphism.opacity));
    }
  };

  const updateTheme = async (newTheme: Partial<ThemeConfig>) => {
    try {
      const updatedTheme = { ...theme, ...newTheme };
      setTheme(updatedTheme);
      await desktopApi.saveTheme(updatedTheme);
    } catch (error) {
      console.error('更新主题失败:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = theme.mode === 'dark' ? 'light' : theme.mode === 'light' ? 'auto' : 'dark';
    await updateTheme({ mode: newMode });
  };

  const toggleGlassmorphism = async () => {
    await updateTheme({
      glassmorphism: {
        ...theme.glassmorphism,
        enabled: !theme.glassmorphism.enabled,
      },
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        updateTheme,
        toggleTheme,
        toggleGlassmorphism,
        applyThemeStyles,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
