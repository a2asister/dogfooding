import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

export const createMockDesktopConfig = (overrides = {}) => ({
  id: 1,
  wallpaper: 'https://example.com/wallpaper.jpg',
  layout: [
    { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' as const },
  ],
  taskbarConfig: {
    showTime: true,
    position: 'bottom' as const,
    showSearch: true,
    showNotifications: true,
    autoHide: false,
  },
  startMenu: [
    { id: '1', name: '文件资源管理器', icon: 'explorer' },
  ],
  theme: {
    mode: 'dark' as const,
    primaryColor: '#0078d7',
    glassmorphism: {
      enabled: true,
      blur: 20,
      opacity: 0.85,
      saturation: 1.2,
    },
    transparency: 0.85,
  },
  display: {
    scale: 1,
    fontFamily: 'Segoe UI',
    animationsEnabled: true,
    iconSize: 'medium' as const,
  },
  dateTime: {
    timeFormat: '24h' as const,
    dateFormat: 'YYYY-MM-DD',
    showSeconds: false,
    showDate: true,
  },
  personalization: {
    accentColor: '#0078d7',
    soundEffects: true,
    notificationsEnabled: true,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockWindowState = (overrides = {}) => ({
  windowId: 'test-window-1',
  title: '测试窗口',
  type: 'explorer' as const,
  x: 100,
  y: 100,
  width: 700,
  height: 500,
  isMinimized: false,
  isMaximized: false,
  zIndex: 1,
  data: null,
  ...overrides,
});

export const createMockWebApp = (overrides = {}) => ({
  id: 'test-app-1',
  name: '测试应用',
  icon: '🌐',
  url: 'https://example.com',
  description: '这是一个测试应用',
  category: '工具',
  isBuiltIn: false,
  ...overrides,
});

export const createMockProcess = (overrides = {}) => ({
  id: 'process-1',
  name: '测试进程',
  type: 'explorer',
  memoryUsage: 256,
  cpuUsage: 5.2,
  startTime: new Date().toISOString(),
  windowId: 'window-1',
  ...overrides,
});
