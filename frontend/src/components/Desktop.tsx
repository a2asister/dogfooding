import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DesktopConfig, DesktopIcon, WindowState, FileItem, Widget, Process, WebApp } from '../types';
import { desktopApi, windowStateApi, notificationsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Window from './Window';
import FileExplorer from './FileExplorer';
import TextEditor from './TextEditor';
import SettingsPanel from './SettingsPanel';
import NotificationCenter from './NotificationCenter';
import SearchPanel from './SearchPanel';
import ImageViewer from './ImageViewer';
import VideoPlayer from './VideoPlayer';
import DocumentReader from './DocumentReader';
import WebAppComponent from './WebApp';
import AppStore from './AppStore';
import Widgets from './Widgets';
import LockScreen from './LockScreen';
import TaskManager from './TaskManager';

const iconMap: Record<string, string> = {
  computer: '💻',
  recycle: '🗑️',
  folder: '📁',
  file: '📄',
  explorer: '📂',
  settings: '⚙️',
  notepad: '📝',
  calculator: '🧮',
  'image-viewer': '🖼️',
  'video-player': '🎬',
  'document-reader': '📄',
  'app-store': '🏪',
  'task-manager': '📊',
};

const DesktopContent: React.FC = () => {
  const [config, setConfig] = useState<DesktopConfig | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'w1', type: 'time', x: 20, y: 20, width: 250, height: 150 },
    { id: 'w2', type: 'weather', x: 20, y: 180, width: 250, height: 200 },
    { id: 'w3', type: 'calendar', x: 20, y: 390, width: 250, height: 250 },
  ]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const [showTaskbarContextMenu, setShowTaskbarContextMenu] = useState(false);
  const [taskbarContextMenuPos, setTaskbarContextMenuPos] = useState({ x: 0, y: 0 });
  const [idleTime, setIdleTime] = useState(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initialProcesses: Process[] = [
      { id: '1001', name: '文件资源管理器', type: 'explorer', memoryUsage: 256, cpuUsage: 5.2, startTime: new Date().toISOString() },
      { id: '1002', name: '设置', type: 'settings', memoryUsage: 128, cpuUsage: 2.1, startTime: new Date().toISOString() },
      { id: '1003', name: '桌面', type: 'desktop', memoryUsage: 512, cpuUsage: 8.5, startTime: new Date().toISOString() },
      { id: '1004', name: '通知中心', type: 'notifications', memoryUsage: 64, cpuUsage: 1.2, startTime: new Date().toISOString() },
    ];
    setProcesses(initialProcesses);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (idleTime >= 300 && !isLocked) {
      setIsLocked(true);
    }
  }, [idleTime, isLocked]);

  const resetIdleTime = () => {
    setIdleTime(0);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTime);
    });
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTime);
      });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        openTaskManager();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (config?.display?.scale) {
      document.documentElement.style.setProperty('--display-scale', String(config.display.scale));
    } else {
      document.documentElement.style.setProperty('--display-scale', '1');
    }
  }, [config?.display?.scale]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDesktopConfig();
    loadWindowStates();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('加载未读通知失败', err);
    }
  };

  const loadDesktopConfig = async () => {
    try {
      const response = await desktopApi.getConfig();
      setConfig(response.data);
    } catch (err) {
      console.error('加载桌面配置失败', err);
    }
  };

  const loadWindowStates = async () => {
    try {
      const response = await windowStateApi.getAllWindows();
      setWindows(response.data);
      setIsLoaded(true);
    } catch (err) {
      console.error('加载窗口状态失败', err);
      setIsLoaded(true);
    }
  };

  const saveWindowState = async (windowState: WindowState) => {
    try {
      await windowStateApi.createWindow(windowState);
      addProcess(windowState);
    } catch (err) {
      console.error('保存窗口状态失败', err);
    }
  };

  const addProcess = (windowState: WindowState) => {
    const newProcess: Process = {
      id: String(Date.now()),
      name: windowState.title,
      type: windowState.type,
      memoryUsage: Math.floor(Math.random() * 500) + 100,
      cpuUsage: Math.floor(Math.random() * 20) + 1,
      startTime: new Date().toISOString(),
      windowId: windowState.windowId,
    };
    setProcesses(prev => [...prev, newProcess]);
  };

  const updateWindowState = async (windowId: string, updates: Partial<WindowState>) => {
    try {
      await windowStateApi.updateWindow(windowId, updates);
    } catch (err) {
      console.error('更新窗口状态失败', err);
    }
  };

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.type === 'app') {
      if (icon.id === '1') {
        openFileExplorer();
      } else if (icon.id === '2') {
        openTrash();
      } else if (icon.id === '3') {
        openSettings();
      } else if (icon.id === '4') {
        openTaskManager();
      } else if (icon.id === '5') {
        openAppStore();
      }
    }
  };

  const openFileExplorer = () => {
    const windowId = `explorer-${Date.now()}`;
    const newWindow: WindowState = {
      windowId,
      title: '文件资源管理器',
      type: 'explorer',
      x: 100 + windows.length * 30,
      y: 50 + windows.length * 30,
      width: 700,
      height: 500,
      zIndex: windows.length + 1,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const openTrash = () => {
    const windowId = `trash-${Date.now()}`;
    const newWindow: WindowState = {
      windowId,
      title: '回收站',
      type: 'trash',
      x: 150 + windows.length * 30,
      y: 80 + windows.length * 30,
      width: 700,
      height: 500,
      zIndex: windows.length + 1,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const openSettings = () => {
    setShowSettings(true);
    setStartMenuOpen(false);
  };

  const openTaskManager = () => {
    const windowId = `task-manager-${Date.now()}`;
    const newWindow: WindowState = {
      windowId,
      title: '任务管理器',
      type: 'task-manager',
      x: 200 + windows.length * 30,
      y: 100 + windows.length * 30,
      width: 650,
      height: 500,
      zIndex: windows.length + 1,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const openAppStore = () => {
    const windowId = `app-store-${Date.now()}`;
    const newWindow: WindowState = {
      windowId,
      title: '应用商店',
      type: 'app-store',
      x: 180 + windows.length * 30,
      y: 120 + windows.length * 30,
      width: 800,
      height: 600,
      zIndex: windows.length + 1,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const handleOpenFile = (file: FileItem) => {
    const windowId = `editor-${Date.now()}`;
    const fileType = file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
      ? 'image-viewer'
      : file.name.toLowerCase().match(/\.(mp4|webm|ogg)$/)
        ? 'video-player'
        : file.name.toLowerCase().match(/\.(pdf|doc|docx|txt)$/)
          ? 'document-reader'
          : 'editor';
    const newWindow: WindowState = {
      windowId,
      title: file.name,
      type: fileType,
      x: 150 + windows.length * 30,
      y: 80 + windows.length * 30,
      width: fileType === 'video-player' ? 800 : 600,
      height: fileType === 'video-player' ? 550 : 450,
      zIndex: windows.length + 1,
      data: file,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const handleAddToDesktop = (app: WebApp) => {
    if (!config) return;
    const exists = config.layout.some(item => item.id === app.id);
    if (exists) return;
    const newIcon: DesktopIcon = {
      id: app.id,
      name: app.name,
      icon: app.icon,
      x: 300 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      type: 'app',
    };
    setConfig({
      ...config,
      layout: [...config.layout, newIcon],
    });
  };

  const handleAddToStartMenu = (app: WebApp) => {
    if (!config) return;
    const exists = config.startMenu.some(item => item.id === app.id);
    if (exists) return;
    setConfig({
      ...config,
      startMenu: [...config.startMenu, { id: app.id, name: app.name, icon: app.icon }],
    });
  };

  const isAppOnDesktop = (appId: string) => {
    return config?.layout.some(item => item.id === appId) || false;
  };

  const isAppInStartMenu = (appId: string) => {
    return config?.startMenu.some(item => item.id === appId) || false;
  };

  const handleCloseWindow = async (windowId: string) => {
    setWindows(windows.filter((w) => w.windowId !== windowId));
    setProcesses(prev => prev.filter(p => p.windowId !== windowId));
    try {
      await windowStateApi.closeWindow(windowId);
    } catch (err) {
      console.error('关闭窗口失败', err);
    }
  };

  const handleCloseProcess = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (process?.windowId) {
      handleCloseWindow(process.windowId);
    }
    setProcesses(prev => prev.filter(p => p.id !== processId));
  };

  const handleMinimizeWindow = (windowId: string) => {
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, isMinimized: true } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { isMinimized: true });
  };

  const handleRestoreWindow = (windowId: string) => {
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, isMinimized: false } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { isMinimized: false });
  };

  const handleMaximizeWindow = (windowId: string, isMaximized: boolean) => {
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, isMaximized } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { isMaximized });
  };

  const handleMoveWindow = (windowId: string, x: number, y: number) => {
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, x, y } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { x, y });
  };

  const handleResizeWindow = (windowId: string, width: number, height: number) => {
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, width, height } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { width, height });
  };

  const handleTaskbarItemClick = (windowId: string) => {
    const window = windows.find((w) => w.windowId === windowId);
    if (window?.isMinimized) {
      handleRestoreWindow(windowId);
    }
  };

  const bringToFront = (windowId: string) => {
    const maxZIndex = Math.max(...windows.map((w) => w.zIndex || 0), 0);
    const updatedWindows = windows.map((w) =>
      w.windowId === windowId ? { ...w, zIndex: maxZIndex + 1 } : w
    );
    setWindows(updatedWindows);
    updateWindowState(windowId, { zIndex: maxZIndex + 1 });
  };

  const handleWidgetMove = (id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const handleWidgetClose = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const addWidget = (type: 'time' | 'weather' | 'todo' | 'calendar') => {
    const heights: Record<string, number> = {
      time: 150,
      weather: 200,
      todo: 250,
      calendar: 250,
    };
    const newWidget: Widget = {
      id: `w-${Date.now()}`,
      type,
      x: 300 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 250,
      height: heights[type],
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetMenu(false);
  };

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.stopPropagation();
    setSelectedIcon(iconId);
    setDraggingIcon(iconId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIcon && config) {
      const icon = config.layout.find((i) => i.id === draggingIcon);
      if (icon) {
        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        const newLayout = config.layout.map((i) =>
          i.id === draggingIcon
            ? { ...i, x: Math.max(0, i.x + deltaX), y: Math.max(0, i.y + deltaY) }
            : i
        );
        setConfig({ ...config, layout: newLayout });
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handleMouseUp = async () => {
    if (draggingIcon && config) {
      await desktopApi.saveLayout(config.layout);
    }
    setDraggingIcon(null);
  };

  const handleDesktopClick = () => {
    setSelectedIcon(null);
    setStartMenuOpen(false);
    setShowSettings(false);
    setShowNotifications(false);
    setShowSearch(false);
    setShowWidgetMenu(false);
    setShowTaskbarContextMenu(false);
  };

  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskbarContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowTaskbarContextMenu(true);
    setShowWidgetMenu(false);
    setStartMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConfigUpdate = (newConfig: DesktopConfig) => {
    setConfig(newConfig);
  };

  const handleOpenApp = (appId: string) => {
    if (appId === 'explorer') {
      openFileExplorer();
    } else if (appId === 'settings') {
      openSettings();
    } else if (appId === 'task-manager') {
      openTaskManager();
    } else if (appId === 'app-store') {
      openAppStore();
    }
    setShowSearch(false);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setIdleTime(0);
  };

  if (!config || !isLoaded) {
    return <div style={{ padding: '20px', color: 'white', background: '#333', height: '100vh' }}>加载中...</div>;
  }

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowWidgetMenu(true);
      }}
    >
      <div
        className="desktop"
        style={{
          backgroundImage: `url(${config.wallpaper})`,
          backgroundSize: 'cover',
          height: config.taskbarConfig.position === 'top' || config.taskbarConfig.position === 'bottom'
            ? 'calc(100% - 48px)'
            : '100%',
          marginLeft: config.taskbarConfig.position === 'left' ? '48px' : '0',
          marginRight: config.taskbarConfig.position === 'right' ? '48px' : '0',
          marginTop: config.taskbarConfig.position === 'top' ? '48px' : '0',
          position: 'relative',
        }}
        onClick={handleDesktopClick}
      >
        <Widgets
          widgets={widgets}
          onWidgetMove={handleWidgetMove}
          onWidgetClose={handleWidgetClose}
        />

        {showWidgetMenu && (
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 200,
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              padding: '8px 0',
              minWidth: '180px',
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '8px 16px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #eee' }}>
              ➕ 添加小组件
            </div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => addWidget('time')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              🕐 时间
            </div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => addWidget('weather')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              🌤️ 天气
            </div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => addWidget('todo')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              ✅ 待办事项
            </div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => addWidget('calendar')}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              📅 日历
            </div>
            <div style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '13px', borderTop: '1px solid #eee' }}
              onClick={() => setShowWidgetMenu(false)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              取消
            </div>
          </div>
        )}

        <div className="desktop-icons-container">
          {config.layout.map((icon) => (
            <div
              key={icon.id}
              className={`desktop-icon ${selectedIcon === icon.id ? 'selected' : ''}`}
              style={{ left: icon.x, top: icon.y }}
              onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
              onDoubleClick={() => handleIconDoubleClick(icon)}
            >
              <div className="icon-image">{iconMap[icon.icon] || '📄'}</div>
              <div className="icon-name">{icon.name}</div>
            </div>
          ))}
        </div>

        {windows.map((window) => (
          <Window
            key={window.windowId}
            window={window}
            onClose={handleCloseWindow}
            onMinimize={handleMinimizeWindow}
            onMaximize={handleMaximizeWindow}
            onMove={handleMoveWindow}
            onResize={handleResizeWindow}
            onFocus={() => bringToFront(window.windowId)}
          >
            {window.type === 'explorer' && <FileExplorer onOpenFile={handleOpenFile} />}
            {window.type === 'trash' && <FileExplorer onOpenFile={handleOpenFile} showTrash={true} />}
            {window.type === 'editor' && window.data && <TextEditor file={window.data} onSave={() => { }} />}
            {window.type === 'image-viewer' && window.data && <ImageViewer file={window.data} />}
            {window.type === 'video-player' && window.data && <VideoPlayer file={window.data} />}
            {window.type === 'document-reader' && window.data && <DocumentReader file={window.data} />}
            {window.type === 'web-app' && window.data && <WebAppComponent app={window.data} />}
            {window.type === 'app-store' && (
              <AppStore 
                onAddToDesktop={handleAddToDesktop} 
                onAddToStartMenu={handleAddToStartMenu}
                isAppOnDesktop={isAppOnDesktop}
                isAppInStartMenu={isAppInStartMenu}
              />
            )}
            {window.type === 'task-manager' && (
              <TaskManager
                processes={processes}
                onCloseProcess={handleCloseProcess}
                onClose={() => handleCloseWindow(window.windowId)}
              />
            )}
          </Window>
        ))}
      </div>

      <div 
        className={`taskbar position-${config.taskbarConfig.position || 'bottom'} ${config.taskbarConfig.autoHide ? 'auto-hide' : ''}`}
        onContextMenu={handleTaskbarContextMenu}
      >
        <div className="taskbar-left">
          <div className="start-button" onClick={() => setStartMenuOpen(!startMenuOpen)}>
            ⊞
          </div>
          {config.taskbarConfig.showSearch !== false && (
            <div className="search-button" onClick={() => setShowSearch(!showSearch)}>
              🔍
            </div>
          )}
        </div>

        <div className="taskbar-items">
          {windows.map((w) => (
            <div
              key={w.windowId}
              className={`taskbar-item ${w.isMinimized ? 'minimized' : ''}`}
              onClick={() => handleTaskbarItemClick(w.windowId)}
              title={w.title}
            >
              {w.title}
            </div>
          ))}
        </div>

        <div className="taskbar-right-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsLocked(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            title="锁定屏幕"
          >
            🔒
          </button>
          {config.taskbarConfig.showNotifications !== false && (
            <div className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </div>
          )}
          {config.taskbarConfig.showTime !== false && (
            <div className="taskbar-time">
              <div>{currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: config.dateTime?.showSeconds ? '2-digit' : undefined })}</div>
              {config.dateTime?.showDate !== false && <div>{currentTime.toLocaleDateString('zh-CN')}</div>}
            </div>
          )}
        </div>
      </div>

      <div className={`start-menu ${startMenuOpen ? 'open' : ''} position-${config.taskbarConfig.position || 'bottom'}`}>
        <div style={{ color: 'var(--text-primary)', marginBottom: '16px', padding: '8px' }}>
          用户: {user?.username}
        </div>
        <div className="start-menu-items">
          {config.startMenu.map((item) => (
            <div
              key={item.id}
              className="start-menu-item"
              onClick={() => {
                if (item.id === '1') openFileExplorer();
                if (item.id === '2') openSettings();
                if (item.id === '4') openTaskManager();
                if (item.id === '5') openAppStore();
                setStartMenuOpen(false);
              }}
            >
              <div className="start-menu-icon">{iconMap[item.icon] || '📄'}</div>
              <div className="start-menu-name">{item.name}</div>
            </div>
          ))}
        </div>
        <div className="start-menu-divider">
          <button className="logout-button" onClick={handleLogout}>
            注销
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <SettingsPanel config={config} onUpdate={handleConfigUpdate} onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="overlay" onClick={() => setShowNotifications(false)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}

      {showSearch && (
        <div className="overlay" onClick={() => setShowSearch(false)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <SearchPanel onClose={() => setShowSearch(false)} onOpenApp={handleOpenApp} />
          </div>
        </div>
      )}

      {showTaskbarContextMenu && (
        <div
          style={{
            position: 'fixed',
            left: taskbarContextMenuPos.x,
            top: taskbarContextMenuPos.y,
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            padding: '8px 0',
            minWidth: '220px',
            zIndex: 10000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => {
              openTaskManager();
              setShowTaskbarContextMenu(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>📊</span>
            <span>任务管理器</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>Ctrl+Shift+Esc</span>
          </div>
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => {
              openSettings();
              setShowTaskbarContextMenu(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>⚙️</span>
            <span>任务栏设置</span>
          </div>
          <div style={{ margin: '4px 0', borderTop: '1px solid #eee' }} />
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => {
              setShowSearch(!showSearch);
              setShowTaskbarContextMenu(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>🔍</span>
            <span>搜索</span>
          </div>
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowTaskbarContextMenu(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span>通知中心</span>
          </div>
          <div style={{ margin: '4px 0', borderTop: '1px solid #eee' }} />
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => {
              setIsLocked(true);
              setShowTaskbarContextMenu(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>🔒</span>
            <span>锁定屏幕</span>
          </div>
          <div
            style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>注销</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Desktop: React.FC = () => {
  const [config, setConfig] = useState<DesktopConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await desktopApi.getConfig();
        setConfig(response.data);
      } catch (err) {
        console.error('加载配置失败', err);
      }
    };
    loadConfig();
  }, []);

  return (
    <ThemeProvider initialConfig={config}>
      <DesktopContent />
    </ThemeProvider>
  );
};

export default Desktop;
