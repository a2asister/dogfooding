import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DesktopConfig, DesktopIcon, WindowState, FileItem } from '../types';
import { desktopApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Window from './Window';
import FileExplorer from './FileExplorer';
import TextEditor from './TextEditor';

const iconMap: Record<string, string> = {
  computer: '💻',
  recycle: '🗑️',
  folder: '📁',
  file: '📄',
  explorer: '📂',
  settings: '⚙️',
};

const Desktop: React.FC = () => {
  const [config, setConfig] = useState<DesktopConfig | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDesktopConfig();
  }, []);

  const loadDesktopConfig = async () => {
    try {
      const response = await desktopApi.getConfig();
      setConfig(response.data);
    } catch (err) {
      console.error('加载桌面配置失败', err);
    }
  };

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.type === 'app' && icon.id === '1') {
      openFileExplorer();
    }
  };

  const openFileExplorer = () => {
    const newWindow: WindowState = {
      id: `explorer-${Date.now()}`,
      title: '文件资源管理器',
      type: 'explorer',
      x: 100 + windows.length * 30,
      y: 50 + windows.length * 30,
      width: 700,
      height: 500,
    };
    setWindows([...windows, newWindow]);
  };

  const handleOpenFile = (file: FileItem) => {
    const newWindow: WindowState = {
      id: `editor-${Date.now()}`,
      title: file.name,
      type: 'editor',
      x: 150 + windows.length * 30,
      y: 80 + windows.length * 30,
      width: 600,
      height: 450,
      data: file,
    };
    setWindows([...windows, newWindow]);
  };

  const handleCloseWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows(windows.map((w) =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const handleRestoreWindow = (id: string) => {
    setWindows(windows.map((w) =>
      w.id === id ? { ...w, isMinimized: false } : w
    ));
  };

  const handleTaskbarItemClick = (id: string) => {
    const window = windows.find((w) => w.id === id);
    if (window?.isMinimized) {
      handleRestoreWindow(id);
    }
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
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!config) {
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
        style={{ backgroundImage: `url(${config.wallpaper})`, backgroundSize: 'cover' }}
        onClick={handleDesktopClick}
      >
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

        {windows.map((window) => (
          <Window
            key={window.id}
            window={window}
            onClose={handleCloseWindow}
            onMinimize={handleMinimizeWindow}
          >
            {window.type === 'explorer' && <FileExplorer onOpenFile={handleOpenFile} />}
            {window.type === 'editor' && window.data && (
              <TextEditor file={window.data} onSave={() => {}} />
            )}
          </Window>
        ))}
      </div>

      <div className="taskbar">
        <div className="start-button" onClick={() => setStartMenuOpen(!startMenuOpen)}>
          ⊞
        </div>
        <div className="taskbar-items">
          {windows.map((w) => (
            <div
              key={w.id}
              className={`taskbar-item ${w.isMinimized ? 'minimized' : ''}`}
              onClick={() => handleTaskbarItemClick(w.id)}
            >
              {w.title}
            </div>
          ))}
        </div>
        <div className="taskbar-time">
          <div>{currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>{currentTime.toLocaleDateString('zh-CN')}</div>
        </div>
      </div>

      <div className={`start-menu ${startMenuOpen ? 'open' : ''}`}>
        <div style={{ color: 'white', marginBottom: '16px', padding: '8px' }}>
          用户: {user?.username}
        </div>
        <div className="start-menu-items">
          {config.startMenu.map((item) => (
            <div
              key={item.id}
              className="start-menu-item"
              onClick={() => {
                if (item.id === '1') openFileExplorer();
                setStartMenuOpen(false);
              }}
            >
              <div className="start-menu-icon">{iconMap[item.icon] || '📄'}</div>
              <div className="start-menu-name">{item.name}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            注销
          </button>
        </div>
      </div>
    </div>
  );
};

export default Desktop;