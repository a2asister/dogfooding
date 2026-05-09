import React from 'react';

const typeIcons = {
  document: '📄',
  image: '🖼️',
  video: '🎬',
  archive: '📦'
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

function FileCard({ file, isSelected, onSelect, onDoubleClick }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(file.id, e);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDoubleClick(file);
  };

  return (
    <div
      className={`file-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`file-preview ${file.type}`}>
        <span className="file-check">
          {isSelected ? '✓' : ''}
        </span>
        <span>{typeIcons[file.type] || '📁'}</span>
      </div>
      <div className="file-info">
        <div className="file-name">{file.name}</div>
        <div className="file-meta">
          {formatSize(file.size)} · {formatDate(file.modifiedAt)}
        </div>
        <div 
          className="file-path" 
          style={{ 
            fontSize: '11px', 
            color: '#1976d2', 
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            backgroundColor: '#e8f4fd',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'inline-block'
          }}
          title={file.path}
        >
          📁 {file.path}
        </div>
      </div>
    </div>
  );
}

export default FileCard;
