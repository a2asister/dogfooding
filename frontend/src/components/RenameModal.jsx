import React, { useState } from 'react';

function RenameModal({ files, isBatch, onConfirmSingle, onConfirmBatch, onCancel }) {
  const [renameMode, setRenameMode] = useState('pattern');
  const [singleName, setSingleName] = useState(files[0]?.name || '');
  const [pattern, setPattern] = useState('文件{index}');
  const [startIndex, setStartIndex] = useState(1);
  const [individualNames, setIndividualNames] = useState(
    files.reduce((acc, file) => {
      acc[file.id] = file.name;
      return acc;
    }, {})
  );

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (singleName.trim()) {
      onConfirmSingle(singleName.trim());
    }
  };

  const handlePatternSubmit = (e) => {
    e.preventDefault();
    if (pattern.trim()) {
      onConfirmBatch('pattern', {
        pattern: pattern.trim(),
        startIndex: parseInt(startIndex) || 1
      });
    }
  };

  const handleIndividualSubmit = (e) => {
    e.preventDefault();
    const renames = files
      .filter(file => individualNames[file.id]?.trim())
      .map(file => ({
        fileId: file.id,
        newName: individualNames[file.id].trim()
      }));
    
    if (renames.length > 0) {
      onConfirmBatch('individual', { renames });
    }
  };

  const handleIndividualNameChange = (fileId, value) => {
    setIndividualNames(prev => ({
      ...prev,
      [fileId]: value
    }));
  };

  const getPreviewNames = () => {
    return files.map((file, index) => {
      const extension = file.name.includes('.') 
        ? '.' + file.name.split('.').pop() 
        : '';
      const baseName = pattern.replace('{index}', String(startIndex + index));
      return `${baseName}${extension}`;
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isBatch ? `批量重命名 (${files.length} 个文件)` : '重命名文件'}
          </div>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        {!isBatch ? (
          <form onSubmit={handleSingleSubmit}>
            <div className="modal-body">
              <div className="rename-item">
                <label className="rename-label">原文件名</label>
                <input
                  type="text"
                  className="modal-input"
                  value={files[0]?.name || ''}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="rename-item">
                <label className="rename-label">新文件名</label>
                <input
                  type="text"
                  className="modal-input"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="modal-btn secondary" onClick={onCancel}>
                取消
              </button>
              <button type="submit" className="modal-btn primary" disabled={!singleName.trim()}>
                确认
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-body" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`modal-btn ${renameMode === 'pattern' ? 'primary' : 'secondary'}`}
                  onClick={() => setRenameMode('pattern')}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  模式重命名
                </button>
                <button
                  type="button"
                  className={`modal-btn ${renameMode === 'individual' ? 'primary' : 'secondary'}`}
                  onClick={() => setRenameMode('individual')}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  逐个重命名
                </button>
              </div>

              {renameMode === 'pattern' && (
                <form onSubmit={handlePatternSubmit}>
                  <div className="rename-item">
                    <label className="rename-label">
                      命名模式 (使用 {'{index}'} 作为序号占位符)
                    </label>
                    <input
                      type="text"
                      className="modal-input"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="例如: 照片{index}、文档{index}"
                    />
                  </div>
                  <div className="rename-item">
                    <label className="rename-label">起始序号</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={startIndex}
                      onChange={(e) => setStartIndex(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="rename-item">
                    <label className="rename-label">预览效果</label>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '6px',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      {getPreviewNames().map((name, index) => (
                        <div key={index} style={{ fontSize: '13px', color: '#666', padding: '2px 0' }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="modal-btn secondary" onClick={onCancel}>
                      取消
                    </button>
                    <button type="submit" className="modal-btn primary" disabled={!pattern.trim()}>
                      确认重命名
                    </button>
                  </div>
                </form>
              )}

              {renameMode === 'individual' && (
                <form onSubmit={handleIndividualSubmit}>
                  <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {files.map((file, index) => (
                      <div key={file.id} className="rename-item">
                        <label className="rename-label">
                          文件 {index + 1}: {file.name}
                        </label>
                        <input
                          type="text"
                          className="modal-input"
                          value={individualNames[file.id] || ''}
                          onChange={(e) => handleIndividualNameChange(file.id, e.target.value)}
                          placeholder="输入新文件名..."
                        />
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="modal-btn secondary" onClick={onCancel}>
                      取消
                    </button>
                    <button type="submit" className="modal-btn primary">
                      确认重命名
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RenameModal;
