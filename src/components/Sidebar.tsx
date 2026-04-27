import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { techNodes, searchTechNodes } from '../data/techNodes';
import type { TechNode, TechCategory, TechStatus } from '../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const CATEGORIES: { value: TechCategory; label: string }[] = [
  { value: 'vanilla', label: '原生' },
  { value: 'library', label: '库' },
  { value: 'framework', label: '框架' },
  { value: 'build-tool', label: '构建工具' },
];

const STATUS_FILTERS: { value: TechStatus; label: string }[] = [
  { value: 'popular', label: '流行' },
  { value: 'maintaining', label: '维护中' },
  { value: 'deprecated', label: '已过时' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { state, selectNode, currentYear, dispatch } = useAppContext();
  const { searchFilter, selectedNodeId, userProgress } = state;

  const [localQuery, setLocalQuery] = useState(searchFilter.query);
  const [showFilters, setShowFilters] = useState(false);

  const getFilteredNodes = () => {
    let nodes = techNodes;

    if (localQuery.trim()) {
      nodes = searchTechNodes(localQuery);
    }

    if (searchFilter.categories.length > 0) {
      nodes = nodes.filter((node) => searchFilter.categories.includes(node.category));
    }

    if (searchFilter.statuses.length > 0) {
      nodes = nodes.filter((node) => searchFilter.statuses.includes(node.status));
    }

    return nodes;
  };

  const filteredNodes = getFilteredNodes();

  const isNodeActive = (node: TechNode) => {
    const startYear = parseInt(node.timelineStart);
    const endYear = node.timelineEnd ? parseInt(node.timelineEnd) : Infinity;
    return currentYear >= startYear && currentYear <= endYear;
  };

  const toggleCategory = (category: TechCategory) => {
    const newCategories = searchFilter.categories.includes(category)
      ? searchFilter.categories.filter((c) => c !== category)
      : [...searchFilter.categories, category];
    dispatch({ type: 'SET_CATEGORIES', payload: newCategories });
  };

  const toggleStatus = (status: TechStatus) => {
    const newStatuses = searchFilter.statuses.includes(status)
      ? searchFilter.statuses.filter((s) => s !== status)
      : [...searchFilter.statuses, status];
    dispatch({ type: 'SET_STATUSES', payload: newStatuses });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      vanilla: '⚡',
      library: '📚',
      framework: '🏗️',
      'build-tool': '🔧',
      other: '📦',
    };
    return icons[category] || '📦';
  };

  const getStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      popular: '#4fc08d',
      maintaining: '#f7df1e',
      deprecated: '#e23237',
      emerging: '#61dafb',
    };
    return colors[status] || '#606070';
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">技术图谱</h2>
        <button className="sidebar-toggle" onClick={onToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="搜索技术..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="search-input"
        />
        {localQuery && (
          <button
            className="search-clear"
            onClick={() => setLocalQuery('')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 17 15.59z" />
            </svg>
          </button>
        )}
      </div>

      <button
        className={`filter-toggle ${showFilters ? 'active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
        </svg>
        <span>筛选</span>
        {(searchFilter.categories.length > 0 || searchFilter.statuses.length > 0) && (
          <span className="filter-count">
            {searchFilter.categories.length + searchFilter.statuses.length}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="sidebar-filters animate-fade-in">
          <div className="filter-group">
            <span className="filter-label">分类</span>
            <div className="filter-options">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`filter-option ${searchFilter.categories.includes(cat.value) ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat.value)}
                >
                  {getCategoryIcon(cat.value)}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">状态</span>
            <div className="filter-options">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status.value}
                  className={`filter-option ${searchFilter.statuses.includes(status.value) ? 'active' : ''}`}
                  onClick={() => toggleStatus(status.value)}
                >
                  <span
                    className="status-dot"
                    style={{ backgroundColor: getStatusDot(status.value) }}
                  />
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {(searchFilter.categories.length > 0 || searchFilter.statuses.length > 0) && (
            <button
              className="clear-filters-btn"
              onClick={() => {
              }}
            >
              清除所有筛选
            </button>
          )}
        </div>
      )}

      <div className="sidebar-stats">
        <span className="stat-label">共 {filteredNodes.length} 项技术</span>
        <span className="stat-active">
          {filteredNodes.filter(isNodeActive).length} 项当前活跃
        </span>
      </div>

      <div className="sidebar-list">
        {filteredNodes.length === 0 ? (
          <div className="sidebar-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p>没有找到匹配的技术</p>
          </div>
        ) : (
          filteredNodes.map((node) => {
            const progress = userProgress[node.id];
            const isActive = isNodeActive(node);
            const isSelected = node.id === selectedNodeId;

            return (
              <button
                key={node.id}
                className={`sidebar-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => selectNode(node.id)}
              >
                <div
                  className="item-icon"
                  style={{ backgroundColor: node.color }}
                >
                  {node.iconEmoji}
                </div>

                <div className="item-info">
                  <div className="item-header">
                    <span className="item-name">{node.displayName}</span>
                    <span
                      className="item-status-dot"
                      style={{ backgroundColor: getStatusDot(node.status) }}
                    />
                  </div>
                  <span className="item-meta">
                    {node.timelineStart} — {node.timelineEnd || '至今'}
                  </span>
                </div>

                <div className="item-actions">
                  {progress?.isBookmarked && (
                    <svg
                      className="action-icon bookmarked"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  )}
                  {progress?.isCompleted && (
                    <svg
                      className="action-icon completed"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="var(--accent-green)"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
