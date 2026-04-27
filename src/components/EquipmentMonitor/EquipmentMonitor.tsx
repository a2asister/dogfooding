import { useMemo, useState } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import type { Device, DeviceType, DeviceStatus } from '@/types';
import styles from './EquipmentMonitor.module.css';

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  fault: '#ef4444',
  maintenance: '#f59e0b',
};

const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: '在线',
  offline: '离线',
  fault: '故障',
  maintenance: '维护中',
};

const TYPE_LABELS: Record<DeviceType, string> = {
  trafficLight: '信号灯',
  camera: '摄像头',
  magneticSensor: '地磁传感器',
};

function DeviceCard({ device }: { device: Device }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={styles.deviceCard}>
      <div className={styles.deviceHeader}>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: STATUS_COLORS[device.status] }}
        />
        <span className={styles.deviceType}>{TYPE_LABELS[device.type]}</span>
        <span className={styles.deviceId}>{device.id}</span>
      </div>

      <h4 className={styles.deviceName}>{device.name}</h4>

      <div className={styles.deviceInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>状态</span>
          <span
            className={styles.infoValue}
            style={{ color: STATUS_COLORS[device.status] }}
          >
            {STATUS_LABELS[device.status]}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>最后心跳</span>
          <span className={styles.infoValue}>
            {Math.floor((Date.now() - device.lastHeartbeat) / 60000)}分钟前
          </span>
        </div>
        {device.batteryLevel !== undefined && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>电量</span>
            <span
              className={styles.infoValue}
              style={{
                color: device.batteryLevel < 30 ? '#ef4444' : '#22c55e',
              }}
            >
              {device.batteryLevel}%
            </span>
          </div>
        )}
        {device.signalDelay !== undefined && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>信号延迟</span>
            <span className={styles.infoValue}>{device.signalDelay}ms</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>故障次数</span>
          <span
            className={styles.infoValue}
            style={{ color: device.faultCount > 0 ? '#ef4444' : '#22c55e' }}
          >
            {device.faultCount}
          </span>
        </div>
      </div>

      <button
        className={styles.detailsButton}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? '收起详情' : '查看详情'}
      </button>

      {showDetails && (
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>设备ID</span>
            <span className={styles.detailValue}>{device.id}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>设备类型</span>
            <span className={styles.detailValue}>{TYPE_LABELS[device.type]}</span>
          </div>
          {device.intersectionId && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>所属路口</span>
              <span className={styles.detailValue}>{device.intersectionId}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>安装位置</span>
            <span className={styles.detailValue}>
              ({device.location.x.toFixed(0)}, {device.location.y.toFixed(0)})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function EquipmentMonitor() {
  const devices = useTrafficStore((state) => state.devices);
  const [filter, setFilter] = useState<{
    type?: DeviceType;
    status?: DeviceStatus;
  }>({});

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (filter.type && device.type !== filter.type) return false;
      if (filter.status && device.status !== filter.status) return false;
      return true;
    });
  }, [devices, filter]);

  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.filter((d) => d.status === 'offline').length;
    const fault = devices.filter((d) => d.status === 'fault').length;
    const faultRate = total > 0 ? ((fault + offline) / total * 100).toFixed(1) : '0';
    return { total, online, offline, fault, faultRate };
  }, [devices]);

  const devicesByType = useMemo(() => {
    const grouped: Record<DeviceType, { total: number; online: number }> = {
      trafficLight: { total: 0, online: 0 },
      camera: { total: 0, online: 0 },
      magneticSensor: { total: 0, online: 0 },
    };
    devices.forEach((device) => {
      grouped[device.type].total++;
      if (device.status === 'online') {
        grouped[device.type].online++;
      }
    });
    return grouped;
  }, [devices]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>设备运维监控</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>设备总数</span>
        </div>
        <div className={`${styles.statCard} ${styles.online}`}>
          <span className={styles.statValue}>{stats.online}</span>
          <span className={styles.statLabel}>在线设备</span>
        </div>
        <div className={`${styles.statCard} ${styles.offline}`}>
          <span className={styles.statValue}>{stats.offline}</span>
          <span className={styles.statLabel}>离线设备</span>
        </div>
        <div className={`${styles.statCard} ${styles.fault}`}>
          <span className={styles.statValue}>{stats.fault}</span>
          <span className={styles.statLabel}>故障设备</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.faultRate}%</span>
          <span className={styles.statLabel}>故障率</span>
        </div>
      </div>

      <div className={styles.typeStats}>
        {Object.entries(devicesByType).map(([type, data]) => (
          <div key={type} className={styles.typeStatItem}>
            <span className={styles.typeLabel}>{TYPE_LABELS[type as DeviceType]}</span>
            <span className={styles.typeValue}>
              {data.online}/{data.total}
            </span>
            <div className={styles.typeBar}>
              <div
                className={styles.typeBarFill}
                style={{
                  width: `${data.total > 0 ? (data.online / data.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filter.type || ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              type: e.target.value ? (e.target.value as DeviceType) : undefined,
            }))
          }
        >
          <option value="">全部类型</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filter.status || ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              status: e.target.value ? (e.target.value as DeviceStatus) : undefined,
            }))
          }
        >
          <option value="">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.devicesGrid}>
        {filteredDevices.length === 0 ? (
          <div className={styles.emptyState}>暂无设备数据</div>
        ) : (
          filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))
        )}
      </div>
    </div>
  );
}