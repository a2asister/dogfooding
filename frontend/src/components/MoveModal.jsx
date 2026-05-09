import React, { useState } from 'react';

const commonPaths = [
  { path: '/documents', name: '文档', icon: '📄' },
  { path: '/images', name: '图片', icon: '🖼️' },
  { path: '/videos', name: '视频', icon: '🎬' },
  { path: '/archives', name: '压缩包', icon: '📦' },
  { path: '/downloads', name: '下载', icon: '⬇️' },
  { path: '/projects', name: '项目', icon: '📁' },
  { path: '/backup', name: '备份', icon: '💾' },
  { path: '/temp', name: '临时', icon: '⏳' }
];

function MoveModal({ fileCount, onConfirm, onCancel }) {
  const [selectedPath, setSelectedPath] = useState('/documents');
  const [customPath, setCustomPath] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetPath = useCustom ? customPath.trim() : selectedPath;
    if (targetPath) {
      onConfirm(targetPath);
    }
  };

  const handleQuickMove = (path) => {
    setSelectedPath(path);
    onConfirm(path);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            移动文件 ({fileCount} 个)
          </div>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="rename-item">
              <label className="rename-label">快速选择目标位置（点击立即移动）</label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px',
                marginTop: '8px'
              }}>
                {commonPaths.map(({ path, name, icon }) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => handleQuickMove(path)}
                    style={{
                      padding: '12px 8px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: selectedPath === path && !useCustom ? '#e8f4fd' : '#fff',
                      borderColor: selectedPath === path && !useCustom ? '#1976d2' : '#e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = selectedPath === path && !useCustom ? '#e8f4fd' : '#fff';
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{icon}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              margin: '16px 0', 
              borderTop: '1px solid #e0e0e0',
              paddingTop: '16px'
            }}>
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}
              >
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                使用自定义路径
              </label>

              {useCustom && (
                <div className="rename-item">
                  <label className="rename-label">自定义目标路径</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="例如: /my/custom/path"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-btn secondary" onClick={onCancel}>
              取消
            </button>
            {useCustom && (
              <button 
                type="submit" 
                className="modal-btn primary"
                disabled={!customPath.trim()}
              >
                确认移动
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoveModal;
