import React from 'react';
import './BottomNav.css';

type TabType = 'farm' | 'warehouse' | 'friends' | 'shop' | 'tasks';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'farm', icon: '🏡', label: '农场' },
    { id: 'warehouse', icon: '🏠', label: '仓库' },
    { id: 'friends', icon: '👥', label: '好友' },
    { id: 'shop', icon: '🛒', label: '商城' },
    { id: 'tasks', icon: '📋', label: '任务' },
  ];
  
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
