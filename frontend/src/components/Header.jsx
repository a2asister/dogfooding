import React from 'react';

function Header({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  stats,
  formatSize,
  totalFiles,
  selectedCount,
  onSelectAll
}) {
  const isAllSelected = totalFiles > 0 && selectedCount === totalFiles;

  return (
    <header className="header">
      <div className="header-top">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索文件名或标签..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {totalFiles > 0 && (
          <button
            className="modal-btn secondary"
            onClick={onSelectAll}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {isAllSelected ? '取消全选' : '全选'}
            {selectedCount > 0 && ` (${selectedCount}/${totalFiles})`}
          </button>
        )}
      </div>
      
      <div className="filter-section">
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="name">按名称排序</option>
          <option value="size">按大小排序</option>
          <option value="modifiedAt">按修改时间排序</option>
          <option value="createdAt">按创建时间排序</option>
        </select>
        
        <select
          className="filter-select"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
        >
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </div>
      
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            文件总数: <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            占用空间: <span className="stat-value">{formatSize(stats.totalSize)}</span>
          </div>
          {stats.byType.document && (
            <div className="stat-item">
              文档: <span className="stat-value">{stats.byType.document.count} 个</span>
            </div>
          )}
          {stats.byType.image && (
            <div className="stat-item">
              图片: <span className="stat-value">{stats.byType.image.count} 个</span>
            </div>
          )}
          {stats.byType.video && (
            <div className="stat-item">
              视频: <span className="stat-value">{stats.byType.video.count} 个</span>
            </div>
          )}
          {stats.byType.archive && (
            <div className="stat-item">
              压缩包: <span className="stat-value">{stats.byType.archive.count} 个</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
