import { useAppContext } from '../context/AppContext';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { state, currentYear, toggleTheme, saveState } = useAppContext();
  const { settings, userProgress } = state;

  const completedCount = Object.values(userProgress).filter((p) => p.isCompleted).length;
  const bookmarkedCount = Object.values(userProgress).filter((p) => p.isBookmarked).length;

  return (
    <header className="app-header">
      <div className="header-left">
        {!sidebarOpen && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title="打开侧边栏"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}

        <div className="logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="url(#gradient1)" strokeWidth="2" />
              <path d="M12 6v12M6 12h12" stroke="url(#gradient1)" strokeWidth="2" />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#61dafb" />
                  <stop offset="50%" stopColor="#646cff" />
                  <stop offset="100%" stopColor="#4fc08d" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">Tech Evolution</h1>
            <span className="logo-subtitle">前端技术演进可视化</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="year-display">
          <span className="year-label">当前年份</span>
          <span className="year-value">{currentYear}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="stats-display">
          <div className="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span>{bookmarkedCount}</span>
          </div>
          <div className="stat-item completed">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{completedCount}</span>
          </div>
        </div>

        <div className="header-divider" />

        <button
          className="header-btn"
          onClick={saveState}
          title="保存进度"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
        </button>

        <button
          className="header-btn"
          onClick={toggleTheme}
          title={settings.theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
        >
          {settings.theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <button className="header-btn help-btn" title="帮助">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </header>
  );
}
