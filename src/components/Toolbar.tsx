import { useState } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import { exportToExcel, printSpreadsheet } from '../utils';
import './Toolbar.css';

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className = '' }: ToolbarProps) {
  const {
    state,
    undo,
    redo,
    canUndo,
    canRedo,
    saveVersion,
    restoreVersion,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    saveSpreadsheet,
    currentUserName
  } = useSpreadsheet();

  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');

  const handleExportExcel = () => {
    exportToExcel(state.data, undefined, `${state.spreadsheetName}.xlsx`);
  };

  const handlePrint = () => {
    printSpreadsheet('spreadsheet-container');
  };

  const handleSaveVersion = () => {
    if (versionDescription.trim()) {
      saveVersion(versionDescription.trim());
      setVersionDescription('');
    }
  };

  const handleAddRow = () => {
    const selectedRow = state.selectedCell?.row ?? state.data.data.length - 1;
    addRow(selectedRow + 1);
  };

  const handleDeleteRow = () => {
    const selectedRow = state.selectedCell?.row;
    if (selectedRow !== undefined && state.data.data.length > 1) {
      deleteRow(selectedRow);
    }
  };

  const handleAddColumn = () => {
    const selectedCol = state.selectedCell?.col ?? (state.data.columns?.length || 10) - 1;
    addColumn(selectedCol + 1, {
      id: `col_${Date.now()}`,
      title: '新列',
      type: 'text',
      width: 120
    });
  };

  const handleDeleteColumn = () => {
    const selectedCol = state.selectedCell?.col;
    if (selectedCol !== undefined && (state.data.columns?.length || 1) > 1) {
      deleteColumn(selectedCol);
    }
  };

  return (
    <div className={`toolbar ${className}`}>
      <div className="toolbar-left">
        <div className="toolbar-section">
          <span className="section-label">文件</span>
          <button
            className="toolbar-btn"
            onClick={saveSpreadsheet}
            title="保存 (Ctrl+S)"
          >
            <span className="btn-icon">💾</span>
            <span className="btn-text">保存</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleExportExcel}
            title="导出Excel"
          >
            <span className="btn-icon">📥</span>
            <span className="btn-text">导出</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handlePrint}
            title="打印"
          >
            <span className="btn-icon">🖨️</span>
            <span className="btn-text">打印</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <span className="section-label">编辑</span>
          <button
            className={`toolbar-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={undo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            <span className="btn-icon">↶</span>
            <span className="btn-text">撤销</span>
          </button>
          <button
            className={`toolbar-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={redo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            <span className="btn-icon">↷</span>
            <span className="btn-text">重做</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <span className="section-label">行列</span>
          <button
            className="toolbar-btn"
            onClick={handleAddRow}
            title="插入行"
          >
            <span className="btn-icon">＋</span>
            <span className="btn-text">插入行</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleDeleteRow}
            title="删除行"
          >
            <span className="btn-icon">－</span>
            <span className="btn-text">删除行</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleAddColumn}
            title="插入列"
          >
            <span className="btn-icon">⊞</span>
            <span className="btn-text">插入列</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleDeleteColumn}
            title="删除列"
          >
            <span className="btn-icon">⊟</span>
            <span className="btn-text">删除列</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="toolbar-section">
          <span className="section-label">版本</span>
          <button
            className="toolbar-btn"
            onClick={() => setShowVersionPanel(!showVersionPanel)}
            title="版本历史"
          >
            <span className="btn-icon">📜</span>
            <span className="btn-text">版本历史</span>
            {state.versions.length > 0 && (
              <span className="badge">{state.versions.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="user-info">
          <span className="user-avatar">
            {currentUserName.charAt(0)}
          </span>
          <span className="user-name">{currentUserName}</span>
        </div>
      </div>

      {showVersionPanel && (
        <div className="version-panel">
          <div className="version-panel-header">
            <h3>版本历史</h3>
            <button
              className="close-btn"
              onClick={() => setShowVersionPanel(false)}
            >
              ✕
            </button>
          </div>

          <div className="version-save-section">
            <input
              type="text"
              placeholder="输入版本描述..."
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveVersion()}
            />
            <button
              className="save-version-btn"
              onClick={handleSaveVersion}
              disabled={!versionDescription.trim()}
            >
              保存版本
            </button>
          </div>

          <div className="version-list">
            {state.versions.length === 0 ? (
              <div className="no-versions">
                暂无保存的版本
              </div>
            ) : (
              state.versions
                .slice()
                .reverse()
                .map((version) => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <div className="version-desc">{version.description}</div>
                      <div className="version-meta">
                        <span className="version-time">
                          {new Date(version.timestamp).toLocaleString('zh-CN')}
                        </span>
                        <span className="version-changes">
                          {version.changesCount} 次修改
                        </span>
                      </div>
                    </div>
                    <button
                      className="restore-btn"
                      onClick={() => {
                        restoreVersion(version.id);
                        setShowVersionPanel(false);
                      }}
                    >
                      恢复
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
