import React from 'react';

const categories = [
  { id: 'all', name: '全部文件', icon: '📁' },
  { id: 'document', name: '文档', icon: '📄' },
  { id: 'image', name: '图片', icon: '🖼️' },
  { id: 'video', name: '视频', icon: '🎬' },
  { id: 'archive', name: '压缩包', icon: '📦' }
];

function Sidebar({ selectedType, onTypeSelect, stats }) {
  const getCount = (type) => {
    if (!stats) return 0;
    if (type === 'all') return stats.total;
    return stats.byType[type]?.count || 0;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        🗂️ 文件整理助手
      </div>
      <nav>
        <ul className="nav-list">
          {categories.map(category => (
            <li
              key={category.id}
              className={`nav-item ${selectedType === category.id ? 'active' : ''}`}
              onClick={() => onTypeSelect(category.id)}
            >
              <span className="nav-icon">{category.icon}</span>
              <span>{category.name}</span>
              <span className="nav-count">{getCount(category.id)}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
