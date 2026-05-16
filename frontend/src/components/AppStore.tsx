import React, { useState } from 'react';
import { WebApp } from '../types';

interface AppStoreProps {
  onAddToDesktop?: (app: WebApp) => void;
  onAddToStartMenu?: (app: WebApp) => void;
  isAppOnDesktop?: (appId: string) => boolean;
  isAppInStartMenu?: (appId: string) => boolean;
}

const AppStore: React.FC<AppStoreProps> = ({ onAddToDesktop, onAddToStartMenu, isAppOnDesktop, isAppInStartMenu }) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const availableApps: WebApp[] = [
    {
      id: 'google-docs',
      name: 'Google Docs',
      icon: '📝',
      url: 'https://docs.google.com',
      description: '在线文档编辑器',
      category: '办公',
      isBuiltIn: false,
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: '📊',
      url: 'https://sheets.google.com',
      description: '在线电子表格',
      category: '办公',
      isBuiltIn: false,
    },
    {
      id: 'google-slides',
      name: 'Google Slides',
      icon: '📽️',
      url: 'https://slides.google.com',
      description: '在线演示文稿',
      category: '办公',
      isBuiltIn: false,
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📋',
      url: 'https://www.notion.so',
      description: '多功能笔记和协作工具',
      category: '效率',
      isBuiltIn: false,
    },
    {
      id: 'trello',
      name: 'Trello',
      icon: '📋',
      url: 'https://trello.com',
      description: '项目管理和协作工具',
      category: '效率',
      isBuiltIn: false,
    },
    {
      id: 'figma',
      name: 'Figma',
      icon: '🎨',
      url: 'https://www.figma.com',
      description: '界面设计和原型工具',
      category: '设计',
      isBuiltIn: false,
    },
    {
      id: 'canva',
      name: 'Canva',
      icon: '🖼️',
      url: 'https://www.canva.com',
      description: '在线图形设计工具',
      category: '设计',
      isBuiltIn: false,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '▶️',
      url: 'https://www.youtube.com',
      description: '在线视频平台',
      category: '娱乐',
      isBuiltIn: false,
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      url: 'https://open.spotify.com',
      description: '在线音乐播放器',
      category: '娱乐',
      isBuiltIn: false,
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐱',
      url: 'https://github.com',
      description: '代码托管和协作平台',
      category: '开发',
      isBuiltIn: false,
    },
    {
      id: 'stackoverflow',
      name: 'Stack Overflow',
      icon: '💻',
      url: 'https://stackoverflow.com',
      description: '程序员问答社区',
      category: '开发',
      isBuiltIn: false,
    },
    {
      id: 'wikipedia',
      name: '维基百科',
      icon: '📚',
      url: 'https://www.wikipedia.org',
      description: '在线百科全书',
      category: '知识',
      isBuiltIn: false,
    },
  ];

  const categories = ['全部', '办公', '效率', '设计', '娱乐', '开发', '知识'];

  const filteredApps = availableApps.filter(app => {
    const matchCategory = selectedCategory === '全部' || app.category === selectedCategory;
    const matchSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div
      className="app-store"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        className="app-store-header"
        style={{
          padding: '24px 32px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '32px', marginRight: '12px' }}>🏪</span>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#333', margin: 0 }}>
            应用商店
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="搜索应用..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: selectedCategory === category ? '#667eea' : '#f0f0f0',
                color: selectedCategory === category ? '#fff' : '#333',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div
        className="app-store-content"
        style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="app-card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    flexShrink: 0,
                  }}
                >
                  {app.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', margin: '0 0 4px 0' }}>
                    {app.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#667eea',
                      background: 'rgba(102, 126, 234, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {app.category}
                  </span>
                  <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    {app.description}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => onAddToDesktop && onAddToDesktop(app)}
                  disabled={isAppOnDesktop && isAppOnDesktop(app.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: isAppOnDesktop && isAppOnDesktop(app.id) ? 'not-allowed' : 'pointer',
                    background: isAppOnDesktop && isAppOnDesktop(app.id) ? '#28a745' : '#667eea',
                    color: '#fff',
                    transition: 'background 0.2s',
                    opacity: isAppOnDesktop && isAppOnDesktop(app.id) ? 0.9 : 1,
                  }}
                >
                  {isAppOnDesktop && isAppOnDesktop(app.id) ? '✅ 已添加到桌面' : '🖥️ 添加到桌面'}
                </button>
                <button
                  onClick={() => onAddToStartMenu && onAddToStartMenu(app)}
                  disabled={isAppInStartMenu && isAppInStartMenu(app.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: isAppInStartMenu && isAppInStartMenu(app.id) ? '1px solid #28a745' : '1px solid #667eea',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: isAppInStartMenu && isAppInStartMenu(app.id) ? 'not-allowed' : 'pointer',
                    background: 'transparent',
                    color: isAppInStartMenu && isAppInStartMenu(app.id) ? '#28a745' : '#667eea',
                    transition: 'all 0.2s',
                    opacity: isAppInStartMenu && isAppInStartMenu(app.id) ? 0.9 : 1,
                  }}
                >
                  {isAppInStartMenu && isAppInStartMenu(app.id) ? '✅ 已添加到开始菜单' : '📋 添加到开始菜单'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.8 }}>🔍</div>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>未找到相关应用</h3>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              尝试其他搜索词或浏览其他分类
            </p>
          </div>
        )}
      </div>

      <div
        className="app-store-footer"
        style={{
          padding: '16px 32px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        共 {availableApps.length} 个可用应用 · 当前分类 {filteredApps.length} 个
      </div>
    </div>
  );
};

export default AppStore;
