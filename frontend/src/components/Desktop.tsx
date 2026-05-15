import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DesktopConfig, DesktopIcon, WindowState, FileItem } from '../types';
import { desktopApi, windowStateApi, notificationsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Window from './Window';
import FileExplorer from './FileExplorer';
import TextEditor from './TextEditor';
import SettingsPanel from './SettingsPanel';
import NotificationCenter from './NotificationCenter';
import SearchPanel from './SearchPanel';

const iconMap: Record<string, string> = {
  computer: '💻',
  recycle: '🗑️',
  folder: '📁',
  file: '📄',
  explorer: '📂',
  settings: '⚙️',
  notepad: '📝',
  calculator: '🧮',
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
  const dragStartPos = useRef({ x: 0, y: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    } catch (err) {
      console.error('保存窗口状态失败', err);
    }
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

  const handleOpenFile = (file: FileItem) => {
    const windowId = `editor-${Date.now()}`;
    const newWindow: WindowState = {
      windowId,
      title: file.name,
      type: 'editor',
      x: 150 + windows.length * 30,
      y: 80 + windows.length * 30,
      width: 600,
      height: 450,
      zIndex: windows.length + 1,
      data: file,
    };
    setWindows([...windows, newWindow]);
    saveWindowState(newWindow);
  };

  const handleCloseWindow = async (windowId: string) => {
    setWindows(windows.filter((w) => w.windowId !== windowId));
    try {
      await windowStateApi.closeWindow(windowId);
    } catch (err) {
      console.error('关闭窗口失败', err);
    }
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
    }
    setShowSearch(false);
  };

  if (!config || !isLoaded) {
    return <div style={{ padding: '20px', color: 'white', background: '#333', height: '100vh' }}>加载中...</div>;
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
        }}
        onClick={handleDesktopClick}
      >
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
            {window.type === 'editor' && window.data && (
              <TextEditor file={window.data} onSave={() => {}} />
            )}
          </Window>
        ))}
      </div>

      <div className={`taskbar position-${config.taskbarConfig.position || 'bottom'} ${config.taskbarConfig.autoHide ? 'auto-hide' : ''}`}>
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
