import { Tag } from 'antd';
import type {
  VehicleStatus,
  OperationalStatus,
  DriverStatus,
  OrderStatus,
  OrderPriority,
  TripStatus,
  AlertLevel,
} from '@/types';

interface StatusTagProps {
  type: 'vehicle' | 'operational' | 'driver' | 'order' | 'priority' | 'trip' | 'alert';
  status: string;
}

const statusConfig = {
  vehicle: {
    online: { color: 'success', label: '在线' },
    offline: { color: 'error', label: '离线' },
    maintenance: { color: 'warning', label: '维护中' },
  },
  operational: {
    idle: { color: 'processing', label: '空闲' },
    operating: { color: 'success', label: '营运中' },
    assigned: { color: 'warning', label: '已派单' },
  },
  driver: {
    'on duty': { color: 'success', label: '在岗' },
    'off duty': { color: 'default', label: '离岗' },
    'on leave': { color: 'warning', label: '休假' },
  },
  order: {
    pending: { color: 'processing', label: '待派单' },
    assigned: { color: 'warning', label: '已派单' },
    accepted: { color: 'processing', label: '待接单' },
    in_trip: { color: 'success', label: '营运中' },
    completed: { color: 'default', label: '已完成' },
    cancelled: { color: 'error', label: '已取消' },
  },
  priority: {
    high: { color: 'error', label: '高优先级' },
    medium: { color: 'warning', label: '中优先级' },
    low: { color: 'success', label: '低优先级' },
  },
  trip: {
    pending: { color: 'processing', label: '待出发' },
    in_progress: { color: 'success', label: '进行中' },
    completed: { color: 'default', label: '已完成' },
    abnormal: { color: 'error', label: '异常' },
  },
  alert: {
    info: { color: 'processing', label: '信息' },
    warning: { color: 'warning', label: '警告' },
    error: { color: 'error', label: '错误' },
    critical: { color: 'error', label: '严重' },
  },
};

const StatusTag = ({ type, status }: StatusTagProps) => {
  const config = statusConfig[type]?.[status as keyof typeof statusConfig.vehicle];
  
  if (!config) {
    return <Tag>{status}</Tag>;
  }

  return (
    <Tag color={config.color}>
      {config.label}
    </Tag>
  );
};

export default StatusTag;
