import React, { useState, useEffect, useRef } from 'react';
import { SearchResult, SearchCategory } from '../types';
import { searchApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface SearchPanelProps {
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onClose, onOpenApp }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  const categories: { id: SearchCategory; label: string; icon: string }[] = [
    { id: 'all', label: '全部', icon: '🔍' },
    { id: 'apps', label: '应用', icon: '📱' },
    { id: 'files', label: '文件', icon: '📄' },
    { id: 'folders', label: '文件夹', icon: '📁' },
    { id: 'settings', label: '设置', icon: '⚙️' },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, activeCategory]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchApi.search(query, activeCategory);
      setResults(response.data.results);
      setSelectedIndex(0);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.category === 'apps' || result.category === 'settings') {
      onOpenApp(result.id.toString());
    }
    onClose();
  };

  const getCategoryColor = (category: SearchCategory) => {
    switch (category) {
      case 'apps': return '#4CAF50';
      case 'files': return '#2196F3';
      case 'folders': return '#FF9800';
      case 'settings': return '#9C27B0';
      default: return '#666';
    }
  };

  return (
    <div className={`search-panel ${isDark ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
      <div className="search-header">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索应用、文件、设置..."
          className="search-input"
          autoFocus
        />
        {query && (
          <button className="clear-btn" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div className="search-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading-state">搜索中...</div>
        ) : results.length === 0 && query ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>未找到相关结果</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">⌨️</span>
            <p>输入关键词开始搜索</p>
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={`${result.category}-${result.id}`}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleResultClick(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="result-icon" style={{ backgroundColor: getCategoryColor(result.category) + '20' }}>
                {result.icon || '📄'}
              </div>
              <div className="result-content">
                <div className="result-name">{result.name}</div>
                <div className="result-description">{result.description || result.category}</div>
              </div>
              <div className="result-category" style={{ color: getCategoryColor(result.category) }}>
                {result.category}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="search-footer">
        <span className="shortcut-hint">↑↓ 选择 | Enter 打开 | Esc 关闭</span>
      </div>
    </div>
  );
};

export default SearchPanel;
