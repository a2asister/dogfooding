import React, { useState, useCallback } from 'react';
import { DesktopConfig, DisplayConfig, DateTimeConfig, PersonalizationConfig, ThemeConfig } from '../types';
import { desktopApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface SettingsPanelProps {
  config: DesktopConfig;
  onUpdate: (config: DesktopConfig) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'wallpaper' | 'taskbar' | 'datetime' | 'display' | 'personalization'>('theme');
  const { theme, updateTheme, isDark } = useTheme();
  const [localConfig, setLocalConfig] = useState(config);

  const debouncedSaveTheme = useCallback(debounce(updateTheme, 300), [updateTheme]);
  
  const debouncedSaveTaskbarConfig = useCallback(
    debounce((taskbarConfig: DesktopConfig['taskbarConfig']) => {
      desktopApi.saveTaskbarConfig(taskbarConfig);
    }, 300),
    []
  );

  const debouncedSaveDisplayConfig = useCallback(
    debounce((display: DisplayConfig) => {
      desktopApi.saveDisplayConfig(display);
    }, 300),
    []
  );

  const debouncedSaveDateTimeConfig = useCallback(
    debounce((dateTime: DateTimeConfig) => {
      desktopApi.saveDateTimeConfig(dateTime);
    }, 300),
    []
  );

  const debouncedSavePersonalizationConfig = useCallback(
    debounce((personalization: PersonalizationConfig) => {
      desktopApi.savePersonalizationConfig(personalization);
    }, 300),
    []
  );

  const handleThemeChange = useCallback((newTheme: Partial<ThemeConfig>) => {
    debouncedSaveTheme(newTheme);
  }, [debouncedSaveTheme]);

  const handleTaskbarChange = useCallback((taskbarConfig: Partial<DesktopConfig['taskbarConfig']>) => {
    const newConfig = { ...localConfig.taskbarConfig, ...taskbarConfig };
    setLocalConfig({ ...localConfig, taskbarConfig: newConfig });
    onUpdate({ ...localConfig, taskbarConfig: newConfig });
    debouncedSaveTaskbarConfig(newConfig);
  }, [localConfig, onUpdate, debouncedSaveTaskbarConfig]);

  const handleDisplayChange = useCallback((display: Partial<DisplayConfig>) => {
    const newConfig = { ...localConfig.display, ...display };
    setLocalConfig({ ...localConfig, display: newConfig });
    onUpdate({ ...localConfig, display: newConfig });
    debouncedSaveDisplayConfig(newConfig);
  }, [localConfig, onUpdate, debouncedSaveDisplayConfig]);

  const handleDateTimeChange = useCallback((dateTime: Partial<DateTimeConfig>) => {
    const newConfig = { ...localConfig.dateTime, ...dateTime };
    setLocalConfig({ ...localConfig, dateTime: newConfig });
    onUpdate({ ...localConfig, dateTime: newConfig });
    debouncedSaveDateTimeConfig(newConfig);
  }, [localConfig, onUpdate, debouncedSaveDateTimeConfig]);

  const handlePersonalizationChange = useCallback((personalization: Partial<PersonalizationConfig>) => {
    const newConfig = { ...localConfig.personalization, ...personalization };
    setLocalConfig({ ...localConfig, personalization: newConfig });
    onUpdate({ ...localConfig, personalization: newConfig });
    debouncedSavePersonalizationConfig(newConfig);
  }, [localConfig, onUpdate, debouncedSavePersonalizationConfig]);

  const wallpaperPresets = [
    'https://images.wallpapersden.com/image/download/windows-11-4k-esthetics_bWpmZ22UmZqaraWkpJRobWllrWdpZWU.jpg',
    'https://images.wallpapersden.com/image/download/minimalist-mountain-sunrise_a2ZlbmOUmZqaraWkpJRmbmdlrWZlbWU.jpg',
    'https://images.wallpapersden.com/image/download/aurora-borealis-4k-mountain_bWplaWWUmZqaraWkpJRmbmdlrWZlbWU.jpg',
    'https://images.wallpapersden.com/image/download/ocean-sunset-4k_a2ZlbmOUmZqaraWkpJRmbmdlrWZlbWU.jpg',
  ];

  const handleWallpaperChange = async (wallpaper: string) => {
    try {
      await desktopApi.saveWallpaper(wallpaper);
      setLocalConfig({ ...localConfig, wallpaper });
      onUpdate({ ...localConfig, wallpaper });
    } catch (error) {
      console.error('更换壁纸失败:', error);
    }
  };

  const tabs = [
    { id: 'theme', label: '主题', icon: '🎨' },
    { id: 'wallpaper', label: '壁纸', icon: '🖼️' },
    { id: 'taskbar', label: '任务栏', icon: '📋' },
    { id: 'datetime', label: '时间日期', icon: '🕐' },
    { id: 'display', label: '显示', icon: '🖥️' },
    { id: 'personalization', label: '个性化', icon: '✨' },
  ];

  const tabContent = {
    theme: (
      <div className="settings-section">
        <h3>主题设置</h3>
        <div className="setting-item">
          <label>颜色模式</label>
          <div className="theme-buttons">
            {(['light', 'dark', 'auto'] as const).map((mode) => (
              <button
                key={mode}
                className={`theme-btn ${theme.mode === mode ? 'active' : ''}`}
                onClick={() => updateTheme({ mode })}
              >
                {mode === 'light' ? '☀️ 浅色' : mode === 'dark' ? '🌙 深色' : '🔄 跟随系统'}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-item">
          <label>主题色</label>
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
          />
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={theme.glassmorphism.enabled}
              onChange={(e) => updateTheme({ glassmorphism: { ...theme.glassmorphism, enabled: e.target.checked } })}
            />
            启用毛玻璃效果
          </label>
        </div>
        {theme.glassmorphism.enabled && (
          <>
            <div className="setting-item">
              <label>模糊程度: {theme.glassmorphism.blur}px</label>
              <input
                type="range"
                min="0"
                max="50"
                value={theme.glassmorphism.blur}
                onChange={(e) => handleThemeChange({ glassmorphism: { ...theme.glassmorphism, blur: Number(e.target.value) } })}
              />
            </div>
            <div className="setting-item">
              <label>透明度: {Math.round(theme.glassmorphism.opacity * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={theme.glassmorphism.opacity}
                onChange={(e) => handleThemeChange({ glassmorphism: { ...theme.glassmorphism, opacity: Number(e.target.value) } })}
              />
            </div>
          </>
        )}
      </div>
    ),
    wallpaper: (
      <div className="settings-section">
        <h3>壁纸设置</h3>
        <div className="wallpaper-grid">
          {wallpaperPresets.map((wp, index) => (
            <div
              key={index}
              className={`wallpaper-preview ${localConfig.wallpaper === wp ? 'active' : ''}`}
              style={{ backgroundImage: `url(${wp})` }}
              onClick={() => handleWallpaperChange(wp)}
            />
          ))}
        </div>
        <div className="setting-item" style={{ marginTop: '20px' }}>
          <label>自定义壁纸URL</label>
          <input
            type="text"
            value={localConfig.wallpaper}
            onChange={(e) => handleWallpaperChange(e.target.value)}
            placeholder="输入壁纸图片URL"
          />
        </div>
      </div>
    ),
    taskbar: (
      <div className="settings-section">
        <h3>任务栏设置</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.taskbarConfig.showTime}
              onChange={(e) => handleTaskbarChange({ showTime: e.target.checked })}
            />
            显示时间
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.taskbarConfig.showSearch}
              onChange={(e) => handleTaskbarChange({ showSearch: e.target.checked })}
            />
            显示搜索按钮
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.taskbarConfig.showNotifications}
              onChange={(e) => handleTaskbarChange({ showNotifications: e.target.checked })}
            />
            显示通知按钮
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.taskbarConfig.autoHide}
              onChange={(e) => handleTaskbarChange({ autoHide: e.target.checked })}
            />
            自动隐藏任务栏
          </label>
        </div>
        <div className="setting-item">
          <label>位置</label>
          <select
            value={localConfig.taskbarConfig.position || 'bottom'}
            onChange={(e) => handleTaskbarChange({ position: e.target.value as 'bottom' | 'top' | 'left' | 'right' })}
          >
            <option value="bottom">底部</option>
            <option value="top">顶部</option>
            <option value="left">左侧</option>
            <option value="right">右侧</option>
          </select>
        </div>
      </div>
    ),
    datetime: (
      <div className="settings-section">
        <h3>时间日期设置</h3>
        <div className="setting-item">
          <label>时间格式</label>
          <select
            value={localConfig.dateTime.timeFormat}
            onChange={(e) => handleDateTimeChange({ timeFormat: e.target.value as '12h' | '24h' })}
          >
            <option value="12h">12小时制</option>
            <option value="24h">24小时制</option>
          </select>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.dateTime.showSeconds}
              onChange={(e) => handleDateTimeChange({ showSeconds: e.target.checked })}
            />
            显示秒数
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.dateTime.showDate}
              onChange={(e) => handleDateTimeChange({ showDate: e.target.checked })}
            />
            显示日期
          </label>
        </div>
      </div>
    ),
    display: (
      <div className="settings-section">
        <h3>显示设置</h3>
        <div className="setting-item">
          <label>缩放: {Math.round(localConfig.display.scale * 100)}%</label>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={localConfig.display.scale}
            onChange={(e) => handleDisplayChange({ scale: Number(e.target.value) })}
          />
        </div>
        <div className="setting-item">
          <label>图标大小</label>
          <select
            value={localConfig.display.iconSize}
            onChange={(e) => handleDisplayChange({ iconSize: e.target.value as 'small' | 'medium' | 'large' })}
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.display.animationsEnabled}
              onChange={(e) => handleDisplayChange({ animationsEnabled: e.target.checked })}
            />
            启用动画效果
          </label>
        </div>
      </div>
    ),
    personalization: (
      <div className="settings-section">
        <h3>个性化设置</h3>
        <div className="setting-item">
          <label>强调色</label>
          <input
            type="color"
            value={localConfig.personalization.accentColor}
            onChange={(e) => handlePersonalizationChange({ accentColor: e.target.value })}
          />
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.personalization.soundEffects}
              onChange={(e) => handlePersonalizationChange({ soundEffects: e.target.checked })}
            />
            启用音效
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={localConfig.personalization.notificationsEnabled}
              onChange={(e) => handlePersonalizationChange({ notificationsEnabled: e.target.checked })}
            />
            启用通知
          </label>
        </div>
      </div>
    ),
  };

  return (
    <div className={`settings-panel ${isDark ? 'dark' : 'light'}`}>
      <div className="settings-header">
        <h2>⚙️ 系统设置</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="settings-body">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <span className="sidebar-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
        </div>
        <div className="settings-content">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
