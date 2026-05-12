import React, { useState } from 'react';
import { ApprovalNode } from '../types';
import NodeCard from './NodeCard';

interface ApprovalFlowChartProps {
  nodes: ApprovalNode[];
  onApprove?: (nodeId: number) => void;
  onReject?: (nodeId: number) => void;
}

const ApprovalFlowChart: React.FC<ApprovalFlowChartProps> = ({ nodes, onApprove, onReject }) => {
  const [hoveredNode, setHoveredNode] = useState<ApprovalNode | null>(null);
  const [nodePosition, setNodePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [recentAction, setRecentAction] = useState<{ nodeId: number; action: string } | null>(null);

  const sortedNodes = [...nodes].sort((a, b) => a.order - b.order);
  const nodeSpacing = 180;
  const startX = 80;
  const centerY = 150;
  const svgWidth = startX + sortedNodes.length * nodeSpacing + 80;
  const svgHeight = 300;

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#38ef7d';
      case 'rejected':
        return '#f45c43';
      case 'current':
        return '#667eea';
      default:
        return '#e0e0e0';
    }
  };

  const getLineColor = (status: string) => {
    if (status === 'approved') return '#38ef7d';
    return '#e0e0e0';
  };

  const handleNodeHover = (node: ApprovalNode, event: React.MouseEvent) => {
    setHoveredNode(node);
    setNodePosition({ x: event.clientX, y: event.clientY });
  };

  const handleApprove = (nodeId: number) => {
    setRecentAction({ nodeId, action: 'approve' });
    onApprove?.(nodeId);
    setTimeout(() => setRecentAction(null), 1000);
  };

  const handleReject = (nodeId: number) => {
    setRecentAction({ nodeId, action: 'reject' });
    onReject?.(nodeId);
    setTimeout(() => setRecentAction(null), 1000);
  };

  const currentNode = sortedNodes.find((n) => n.status === 'current');

  return (
    <div>
      <div className="flow-container">
        <svg width={svgWidth} height={svgHeight} className="flow-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {sortedNodes.map((node, index) => {
            if (index === sortedNodes.length - 1) return null;
            const nextNode = sortedNodes[index + 1];
            const x1 = startX + index * nodeSpacing + 30;
            const y1 = centerY;
            const x2 = startX + (index + 1) * nodeSpacing - 30;
            const y2 = centerY;
            const isCompleted = node.status === 'approved';

            return (
              <g key={`line-${node.id}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={getLineColor(node.status)}
                  strokeWidth="3"
                  className={isCompleted ? 'connector-line' : ''}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
                <polygon
                  points={`${x2 - 10},${y2 - 5} ${x2},${y2} ${x2 - 10},${y2 + 5}`}
                  fill={getLineColor(node.status)}
                />
              </g>
            );
          })}

          {sortedNodes.map((node, index) => {
            const cx = startX + index * nodeSpacing;
            const cy = centerY;
            const color = getNodeColor(node.status);
            const isCurrent = node.status === 'current';
            const showRipple = recentAction?.nodeId === node.id && recentAction?.action === 'approve';
            const showShake = recentAction?.nodeId === node.id && recentAction?.action === 'reject';

            return (
              <g key={node.id}>
                {showRipple && (
                  <circle cx={cx} cy={cy} r={30} fill="none" stroke="#38ef7d" strokeWidth="3" className="ripple" />
                )}

                <g
                  onMouseEnter={(e) => handleNodeHover(node, e)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={isCurrent ? 'current-node' : ''}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={32}
                    fill={color}
                    opacity={0.3}
                    className={`node-circle ${showShake ? 'shake' : ''}`}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={28}
                    fill={color}
                    filter={isCurrent ? 'url(#glow)' : undefined}
                    className="node-circle"
                  />

                  {node.status === 'approved' && (
                    <path
                      d={`M ${cx - 12} ${cy} L ${cx - 2} ${cy + 12} L ${cx + 14} ${cy - 8}`}
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="check-mark"
                    />
                  )}

                  {node.status === 'rejected' && (
                    <g>
                      <line x1={cx - 10} y1={cy - 10} x2={cx + 10} y2={cy + 10} stroke="white" strokeWidth="4" />
                      <line x1={cx + 10} y1={cy - 10} x2={cx - 10} y2={cy + 10} stroke="white" strokeWidth="4" />
                    </g>
                  )}
                </g>

                <text x={cx} y={cy + 55} textAnchor="middle" fill="#333" fontSize="14" fontWeight="500">
                  {node.name}
                </text>
                <text x={cx} y={cy + 75} textAnchor="middle" fill="#999" fontSize="12">
                  {node.role}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredNode && <NodeCard node={hoveredNode} position={nodePosition} />}

      {currentNode && (
        <div>
          <textarea
            className="comment-input"
            placeholder="请输入审批意见..."
            id="approval-comment"
          />
          <div className="action-buttons">
            <button className="btn btn-approve" onClick={() => handleApprove(currentNode.id)}>
              通过
            </button>
            <button className="btn btn-reject" onClick={() => handleReject(currentNode.id)}>
              驳回
            </button>
          </div>
        </div>
      )}

      <div className="status-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#e0e0e0' }} />
          <span>待处理</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#667eea' }} />
          <span>进行中</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#38ef7d' }} />
          <span>已通过</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f45c43' }} />
          <span>已驳回</span>
        </div>
      </div>
    </div>
  );
};

export default ApprovalFlowChart;
