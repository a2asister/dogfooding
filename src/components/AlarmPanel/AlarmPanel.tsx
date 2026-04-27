import { useMemo, useState } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import type { AlarmRecord, AlarmLevel, AlarmType } from '@/types';
import styles from './AlarmPanel.module.css';

const LEVEL_COLORS: Record<AlarmLevel, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

const LEVEL_LABELS: Record<AlarmLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
};

const TYPE_LABELS: Record<AlarmType, string> = {
  accident: '交通事故',
  congestion: '道路拥堵',
  illegalParking: '违章停车',
  roadOccupation: '占道施工',
  deviceOffline: '设备离线',
};

function AlarmCard({ alarm, onProcess }: { alarm: AlarmRecord; onProcess: () => void }) {
  const currentUser = useTrafficStore((state) => state.currentUser);
  const canProcess = currentUser && currentUser.permissions.includes('operate');

  return (
    <div
      className={styles.alarmCard}
      style={{ borderLeftColor: LEVEL_COLORS[alarm.level] }}
    >
      <div className={styles.alarmHeader}>
        <span
          className={styles.levelBadge}
          style={{ backgroundColor: LEVEL_COLORS[alarm.level] }}
        >
          {LEVEL_LABELS[alarm.level]}
        </span>
        <span className={styles.alarmType}>{TYPE_LABELS[alarm.type]}</span>
        <span className={styles.alarmTime}>
          {new Date(alarm.timestamp).toLocaleString('zh-CN')}
        </span>
      </div>

      <p className={styles.alarmDescription}>{alarm.description}</p>

      {alarm.intersectionId && (
        <div className={styles.alarmLocation}>
          位置: {alarm.intersectionId}
        </div>
      )}

      <div className={styles.alarmFooter}>
        {alarm.status === 'pending' && (
          <>
            <span className={styles.statusBadge}>待处理</span>
            {canProcess && (
              <button className={styles.processButton} onClick={onProcess}>
                开始处理
              </button>
            )}
          </>
        )}
        {alarm.status === 'processing' && (
          <>
            <span className={styles.statusBadgeProcessing}>处理中</span>
            {alarm.处理人 && (
              <span className={styles.handler}>处理人: {alarm.处理人}</span>
            )}
          </>
        )}
        {alarm.status === 'resolved' && (
          <>
            <span className={styles.statusBadgeResolved}>已解决</span>
            {alarm.处理时长 && (
              <span className={styles.duration}>耗时: {alarm.处理时长}分钟</span>
            )}
            {alarm.处理人 && (
              <span className={styles.handler}>处理人: {alarm.处理人}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AlarmPanel() {
  const alarms = useTrafficStore((state) => state.alarms);
  const updateAlarmStatus = useTrafficStore((state) => state.updateAlarmStatus);
  const currentUser = useTrafficStore((state) => state.currentUser);
  const [filter, setFilter] = useState<{
    level?: AlarmLevel;
    type?: AlarmType;
    status?: AlarmRecord['status'];
  }>({});

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      if (filter.level && alarm.level !== filter.level) return false;
      if (filter.type && alarm.type !== filter.type) return false;
      if (filter.status && alarm.status !== filter.status) return false;
      return true;
    });
  }, [alarms, filter]);

  const alarmStats = useMemo(() => {
    const pending = alarms.filter((a) => a.status === 'pending').length;
    const processing = alarms.filter((a) => a.status === 'processing').length;
    const critical = alarms.filter(
      (a) => a.level === 'critical' && a.status !== 'resolved'
    ).length;
    return { pending, processing, critical };
  }, [alarms]);

  const handleProcess = (alarmId: string) => {
    updateAlarmStatus(alarmId, 'processing', currentUser?.name);
  };

  const handleResolve = (alarmId: string) => {
    updateAlarmStatus(alarmId, 'resolved', currentUser?.name);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>交通异常告警</h2>

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{alarmStats.pending}</span>
          <span className={styles.statLabel}>待处理</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{alarmStats.processing}</span>
          <span className={styles.statLabel}>处理中</span>
        </div>
        <div className={`${styles.statItem} ${styles.critical}`}>
          <span className={styles.statValue}>{alarmStats.critical}</span>
          <span className={styles.statLabel}>严重告警</span>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filter.level || ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              level: e.target.value ? (e.target.value as AlarmLevel) : undefined,
            }))
          }
        >
          <option value="">全部级别</option>
          {Object.entries(LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filter.type || ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              type: e.target.value ? (e.target.value as AlarmType) : undefined,
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
              status: e.target.value as AlarmRecord['status'] || undefined,
            }))
          }
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
        </select>
      </div>

      <div className={styles.alarmsList}>
        {filteredAlarms.length === 0 ? (
          <div className={styles.emptyState}>暂无告警记录</div>
        ) : (
          filteredAlarms.map((alarm) => (
            <div key={alarm.id} className={styles.alarmWrapper}>
              <AlarmCard alarm={alarm} onProcess={() => handleProcess(alarm.id)} />
              {alarm.status === 'processing' && currentUser?.permissions.includes('operate') && (
                <button
                  className={styles.resolveButton}
                  onClick={() => handleResolve(alarm.id)}
                >
                  标记已解决
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}