import React from 'react';
import { cn } from '../../utils/cn';

type StatusType = 'normal' | 'warning' | 'danger' | 'info';
type SeverityType = 'low' | 'medium' | 'high' | 'critical';
type AlertType = 'info' | 'warning' | 'danger';
type LevelType = 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  status: StatusType | SeverityType | AlertType | LevelType;
  type?: 'status' | 'severity' | 'alert' | 'level';
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'sm' 
}) => {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'normal':
      case 'info':
      case 'low':
        return 'bg-green-500/20 text-green-400';
      case 'warning':
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'danger':
      case 'high':
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (s: string) => {
    const labels: Record<string, string> = {
      normal: '正常',
      warning: '警告',
      danger: '危险',
      info: '信息',
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };
    return labels[s] || s;
  };

  const sizeStyles = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span className={cn(
      'rounded-full font-medium',
      sizeStyles,
      getStatusStyles(status)
    )}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
