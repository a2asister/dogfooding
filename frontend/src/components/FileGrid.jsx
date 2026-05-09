import React from 'react';
import FileCard from './FileCard.jsx';

function FileGrid({ files, selectedFiles, onFileSelect, onFileDoubleClick, loading }) {
  if (loading) {
    return (
      <div className="file-grid">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-text">加载中...</div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-grid">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">没有找到匹配的文件</div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-grid">
      {files.map(file => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onSelect={onFileSelect}
          onDoubleClick={onFileDoubleClick}
        />
      ))}
    </div>
  );
}

export default FileGrid;
