import React from 'react';
import { ApprovalNode } from '../types';

interface NodeCardProps {
  node: ApprovalNode;
  position: { x: number; y: number };
}

const NodeCard: React.FC<NodeCardProps> = ({ node, position }) => {
  const statusText: Record<string, string> = {
    pending: '待处理',
    current: '进行中',
    approved: '已通过',
    rejected: '已驳回',
  };

  return (
    <div
      className="card-container"
      style={{
        left: position.x + 50,
        top: position.y - 100,
      }}
    >
      <div className="card-inner">
        <div className="card-front">
          <h3>{node.name}</h3>
          <div className="role">角色: {node.role}</div>
          <span className="status-badge">{statusText[node.status]}</span>
        </div>
        <div className="card-back">
          {node.approver && (
            <div className="detail-item">
              <div className="detail-label">审批人</div>
              <div className="detail-value">{node.approver}</div>
            </div>
          )}
          {node.comment && (
            <div className="detail-item">
              <div className="detail-label">审批意见</div>
              <div className="detail-value">{node.comment}</div>
            </div>
          )}
          {node.approvedAt && (
            <div className="detail-item">
              <div className="detail-label">审批时间</div>
              <div className="detail-value">
                {new Date(node.approvedAt).toLocaleString('zh-CN')}
              </div>
            </div>
          )}
          {!node.approver && (
            <div className="detail-item">
              <div className="detail-value" style={{ color: '#999' }}>
                暂无审批信息
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeCard;
