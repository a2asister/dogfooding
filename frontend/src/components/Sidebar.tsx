import React, { useState, useEffect } from 'react';

interface SidebarProps {
  user: any;
  token: string;
  onLogout: () => void;
  currentContext: { type: string; id: number };
  onContextChange: (context: { type: string; id: number }) => void;
  onThemeChange: (theme: string) => void;
}

type TabType = 'files' | 'teams' | 'plugins' | 'shares' | 'settings';

export function Sidebar({ user, token, onLogout, currentContext, onContextChange, onThemeChange }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('files');
  const [teams, setTeams] = useState<any[]>([]);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [context, setContext] = useState(currentContext);

  useEffect(() => {
    setContext(currentContext);
  }, [currentContext]);

  useEffect(() => {
    if (activeTab === 'teams') {
      loadTeams();
    } else if (activeTab === 'plugins') {
      loadPlugins();
    }
  }, [activeTab, token]);

  const loadTeams = async () => {
    try {
      const response = await fetch('http://localhost:3950/api/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const loadPlugins = async () => {
    try {
      const response = await fetch('http://localhost:3950/api/plugins/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPlugins(data.plugins || []);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const handleCreateTeam = async () => {
    const name = prompt('输入团队名称:');
    if (!name) return;

    try {
      const response = await fetch('http://localhost:3950/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description: '' }),
      });
      if (response.ok) {
        loadTeams();
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleSwitchContext = (type: string, id: number, name?: string) => {
    const newContext = { type, id };
    setContext(newContext);
    onContextChange(newContext);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <span className="user-avatar">{(user.username || user.email || 'U')[0].toUpperCase()}</span>
          <span className="user-name">{user.username || user.email || 'User'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('files');
            handleSwitchContext('user', user.id);
          }}
        >
          <span className="nav-icon">📁</span>
          我的文件
        </button>
        <button
          className={`nav-item ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <span className="nav-icon">👥</span>
          团队空间
        </button>
        <button
          className={`nav-item ${activeTab === 'plugins' ? 'active' : ''}`}
          onClick={() => setActiveTab('plugins')}
        >
          <span className="nav-icon">🧩</span>
          插件中心
        </button>
        <button
          className={`nav-item ${activeTab === 'shares' ? 'active' : ''}`}
          onClick={() => setActiveTab('shares')}
        >
          <span className="nav-icon">🔗</span>
          我的分享
        </button>
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="nav-icon">⚙️</span>
          设置
        </button>
      </nav>

      <div className="sidebar-content">
        {activeTab === 'teams' && (
          <div className="team-list">
            <button className="create-team-btn" onClick={handleCreateTeam}>
              + 创建团队
            </button>
            {teams.map((team: any) => (
              <div
                key={team.id}
                className={`team-item ${context.type === 'team' && context.id === team.id ? 'active' : ''}`}
                onClick={() => handleSwitchContext('team', team.id, team.name)}
              >
                <span className="team-icon">🏢</span>
                <span className="team-name">{team.name}</span>
                {context.type === 'team' && context.id === team.id && (
                  <span className="team-active-badge">当前</span>
                )}
              </div>
            ))}

            {context.type === 'team' && (
              <div className="team-members-section">
                <div className="section-header">
                  <span>👥 团队成员</span>
                  <button
                    className="btn-small btn-primary"
                    onClick={() => {
                      const userId = prompt('请输入要邀请的用户 ID:');
                      if (userId) {
                        fetch('http://localhost:3950/api/teams', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: 'temp',
                            description: '',
                          }),
                        })
                          .then(res => res.json())
                          .then(() => {
                            alert('邀请已发送！');
                            loadTeams();
                          })
                          .catch(err => console.error('Failed to invite member:', err));
                      }
                    }}
                  >
                    + 邀请成员
                  </button>
                </div>
                <div className="team-member-info">
                  <span className="info-icon">💡</span>
                  <span className="info-text">切换到团队空间后，使用 team members 命令查看成员</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shares' && (
          <div className="shares-section">
            <div className="section-header">
              <span>📤 我的分享</span>
            </div>
            <div className="share-info">
              <span className="info-icon">📄</span>
              <span className="info-text">在终端中使用以下命令创建分享：</span>
            </div>
            <div className="share-command">
              <code>share filename.txt</code>
            </div>
            <div className="share-command">
              <code>share filename.txt -p edit</code>
            </div>
            <div className="share-command">
              <code>help share</code>
            </div>
            <div className="share-note">
              <span className="info-icon">💡</span>
              <span className="info-text">分享链接可嵌入博客或文档中供他人查看</span>
            </div>
          </div>
        )}

        {activeTab === 'plugins' && (
          <div className="plugin-list">
            <button
              className="browse-plugins-btn"
              onClick={() => window.open('http://localhost:3950/api/plugins/search', '_blank')}
            >
              🔍 浏览插件市场
            </button>
            {plugins.map((plugin: any) => (
              <div key={plugin.id} className="plugin-item">
                <span className="plugin-name">{plugin.name}</span>
                <span className="plugin-version">v{plugin.version}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="setting-item">
              <label>主题设置</label>
              <select
                className="theme-select"
                value={user.theme || 'dark'}
                onChange={async (e) => {
                  const newTheme = e.target.value;
                  try {
                    await fetch('http://localhost:3950/api/auth/profile', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ theme: newTheme }),
                    });
                    onThemeChange(newTheme);
                  } catch (error) {
                    console.error('Failed to update theme:', error);
                  }
                }}
              >
                <option value="dark">深色</option>
                <option value="light">浅色</option>
                <option value="retro-green">复古绿</option>
                <option value="hacker">黑客</option>
              </select>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              退出登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
