import React from 'react';

function DeleteConfirmModal({ fileCount, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">确认删除</div>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '16px', marginBottom: '12px' }}>
            确定要删除选中的 <strong>{fileCount}</strong> 个文件吗？
          </div>
          <div style={{ fontSize: '14px', color: '#dc3545' }}>
            ⚠️ 此操作不可恢复
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn secondary"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="modal-btn danger"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
