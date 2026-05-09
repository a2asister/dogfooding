import React from 'react';

function BatchToolbar({ selectedCount, onClear, onMove, onDelete, onRename, canRename }) {
  return (
    <div className="batch-toolbar">
      <div className="batch-count">
        已选择 {selectedCount} 个文件
      </div>
      <div className="batch-actions">
        {canRename && (
          <button className="batch-btn move" onClick={onRename}>
            重命名
          </button>
        )}
        <button className="batch-btn move" onClick={onMove}>
          移动
        </button>
        <button className="batch-btn delete" onClick={onDelete}>
          删除
        </button>
        <button className="batch-btn cancel" onClick={onClear}>
          取消
        </button>
      </div>
    </div>
  );
}

export default BatchToolbar;
