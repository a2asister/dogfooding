import { useMemo } from 'react';
import { Tooltip, Typography, Space } from 'antd';
import { CarOutlined, CarFilled } from '@ant-design/icons';
import type { Vehicle } from '@/types';

const { Text } = Typography;

interface SimulatedMapProps {
  vehicles: Vehicle[];
  showHeatMap?: boolean;
  heatAreas?: { name: string; count: number; x: number; y: number }[];
  onVehicleClick?: (vehicle: Vehicle) => void;
  selectedVehicleId?: number;
  width?: number;
  height?: number;
}

const SimulatedMap = ({
  vehicles,
  showHeatMap = true,
  heatAreas = [],
  onVehicleClick,
  selectedVehicleId,
  width = 800,
  height = 400,
}: SimulatedMapProps) => {
  const vehiclePoints = useMemo(() => {
    return vehicles
      .filter((v) => v.status === 'online')
      .map((vehicle) => {
        const latRange = { min: 39.8, max: 40.0 };
        const lngRange = { min: 116.2, max: 116.6 };
        
        const x = ((vehicle.location.lng - lngRange.min) / (lngRange.max - lngRange.min)) * (width - 40) + 20;
        const y = ((latRange.max - vehicle.location.lat) / (latRange.max - latRange.min)) * (height - 40) + 20;
        
        return {
          ...vehicle,
          x: Math.max(20, Math.min(width - 20, x)),
          y: Math.max(20, Math.min(height - 20, y)),
        };
      });
  }, [vehicles, width, height]);

  const getVehicleColor = (vehicle: Vehicle) => {
    if (vehicle.isAbnormal) return '#ff4d4f';
    if (vehicle.operationalStatus === 'operating') return '#52c41a';
    if (vehicle.operationalStatus === 'assigned') return '#faad14';
    return '#1890ff';
  };

  const getStatusLabel = (vehicle: Vehicle) => {
    switch (vehicle.operationalStatus) {
      case 'operating': return '营运中';
      case 'assigned': return '已派单';
      case 'idle': return '空闲';
      default: return '未知';
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 40V0m40 40V0M40 0H0m0 40h40\' stroke=\'%23ffffff\' stroke-opacity=\'0.1\' fill=\'none\'/%3E%3C/svg%3E")',
          opacity: 0.5,
        }}
      />

      {showHeatMap && heatAreas.map((area, index) => (
        <Tooltip key={index} title={`${area.name}: ${area.count} 辆车`}>
          <div
            style={{
              position: 'absolute',
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: Math.min(area.count * 8, 120),
              height: Math.min(area.count * 8, 120),
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255, 77, 79, ${Math.min(area.count / 50, 0.8)}) 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        </Tooltip>
      ))}

      {vehiclePoints.map((vehicle) => (
        <Tooltip
          key={vehicle.id}
          title={
            <Space direction="vertical" size="small">
              <Text strong>{vehicle.plate}</Text>
              <Text type="secondary">状态: {getStatusLabel(vehicle)}</Text>
              <Text type="secondary">区域: {vehicle.area}</Text>
              <Text type="secondary">续航: {vehicle.battery}%</Text>
            </Space>
          }
        >
          <div
            onClick={() => onVehicleClick?.(vehicle)}
            style={{
              position: 'absolute',
              left: vehicle.x,
              top: vehicle.y,
              width: selectedVehicleId === vehicle.id ? 20 : 14,
              height: selectedVehicleId === vehicle.id ? 20 : 14,
              borderRadius: '50%',
              backgroundColor: getVehicleColor(vehicle),
              border: selectedVehicleId === vehicle.id ? '3px solid #fff' : '2px solid #fff',
              cursor: 'pointer',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: selectedVehicleId === vehicle.id ? 12 : 10,
              boxShadow: selectedVehicleId === vehicle.id ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
              transition: 'all 0.3s ease',
              zIndex: selectedVehicleId === vehicle.id ? 10 : 1,
            }}
          >
            <CarFilled />
          </div>
        </Tooltip>
      ))}

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <Space direction="vertical" size="small">
          <Space size="small">
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#1890ff' }} />
            <Text>空闲</Text>
          </Space>
          <Space size="small">
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#52c41a' }} />
            <Text>营运中</Text>
          </Space>
          <Space size="small">
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#faad14' }} />
            <Text>已派单</Text>
          </Space>
          <Space size="small">
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
            <Text>异常</Text>
          </Space>
        </Space>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <Space size="small">
          <CarOutlined />
          <Text>在线车辆: {vehiclePoints.length} 辆</Text>
        </Space>
      </div>
    </div>
  );
};

export default SimulatedMap;
