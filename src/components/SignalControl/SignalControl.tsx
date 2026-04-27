import { useState } from 'react';
import { useTrafficStore, hasPermission } from '@/store/trafficStore';
import type { Intersection, SignalState } from '@/types';
import styles from './SignalControl.module.css';

const SIGNAL_COLORS: Record<SignalState, string> = {
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#f59e0b',
};

function SignalLight({ state, size = 40 }: { state: SignalState; size?: number }) {
  return (
    <div
      className={styles.signalLight}
      style={{
        width: size,
        height: size,
        backgroundColor: SIGNAL_COLORS[state],
        boxShadow: `0 0 ${size / 3}px ${SIGNAL_COLORS[state]}`,
      }}
    />
  );
}

function IntersectionCard({ intersection }: { intersection: Intersection }) {
  const { currentUser, updateSignalTiming, lockSignalTiming } = useTrafficStore();
  const [isEditing, setIsEditing] = useState(false);
  const [redDuration, setRedDuration] = useState(intersection.signalTiming.redDuration);
  const [greenDuration, setGreenDuration] = useState(intersection.signalTiming.greenDuration);
  const [yellowDuration, setYellowDuration] = useState(intersection.signalTiming.yellowDuration);

  const canEdit = hasPermission(currentUser, 'config');
  const isLocked = intersection.signalTiming.isLocked;

  const handleSave = () => {
    if (!canEdit || isLocked) return;
    updateSignalTiming(intersection.id, {
      redDuration,
      greenDuration,
      yellowDuration,
    });
    setIsEditing(false);
  };

  const handleLockToggle = () => {
    if (!canEdit) return;
    lockSignalTiming(intersection.id, !isLocked, currentUser?.username || 'unknown');
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{intersection.name}</h3>
        {isLocked && <span className={styles.lockedBadge}>已锁定</span>}
      </div>

      <div className={styles.signalDisplay}>
        <SignalLight state={intersection.signalState} size={50} />
        <div className={styles.signalInfo}>
          <span className={styles.signalState}>
            {intersection.signalState === 'red'
              ? '红灯'
              : intersection.signalState === 'green'
                ? '绿灯'
                : '黄灯'}
          </span>
          {intersection.signalTiming.modifiedBy && (
            <span className={styles.lastModified}>
              修改人: {intersection.signalTiming.modifiedBy}
            </span>
          )}
        </div>
      </div>

      {canEdit && (
        <>
          {isEditing && !isLocked ? (
            <div className={styles.timingEditor}>
              <div className={styles.timingRow}>
                <label>红灯时长(秒)</label>
                <input
                  type="number"
                  value={redDuration}
                  onChange={(e) => setRedDuration(Number(e.target.value))}
                  min={10}
                  max={180}
                />
              </div>
              <div className={styles.timingRow}>
                <label>绿灯时长(秒)</label>
                <input
                  type="number"
                  value={greenDuration}
                  onChange={(e) => setGreenDuration(Number(e.target.value))}
                  min={10}
                  max={180}
                />
              </div>
              <div className={styles.timingRow}>
                <label>黄灯时长(秒)</label>
                <input
                  type="number"
                  value={yellowDuration}
                  onChange={(e) => setYellowDuration(Number(e.target.value))}
                  min={3}
                  max={30}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={handleSave}>
                  保存
                </button>
                <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.currentTiming}>
              <div className={styles.timingItem}>
                <span
                  className={styles.timingColor}
                  style={{ backgroundColor: SIGNAL_COLORS.red }}
                />
                <span>{intersection.signalTiming.redDuration}s</span>
              </div>
              <div className={styles.timingItem}>
                <span
                  className={styles.timingColor}
                  style={{ backgroundColor: SIGNAL_COLORS.green }}
                />
                <span>{intersection.signalTiming.greenDuration}s</span>
              </div>
              <div className={styles.timingItem}>
                <span
                  className={styles.timingColor}
                  style={{ backgroundColor: SIGNAL_COLORS.yellow }}
                />
                <span>{intersection.signalTiming.yellowDuration}s</span>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {!isLocked && (
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                调整配时
              </button>
            )}
            <button
              className={`${styles.lockButton} ${isLocked ? styles.unlockButton : ''}`}
              onClick={handleLockToggle}
            >
              {isLocked ? '解锁' : '锁定'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function SignalControl() {
  const intersections = useTrafficStore((state) => state.intersections);
  const operationLogs = useTrafficStore((state) => state.operationLogs);
  const currentUser = useTrafficStore((state) => state.currentUser);

  const recentLogs = operationLogs
    .filter((log) => log.target === '信号灯')
    .slice(0, 5);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>智能信号控制</h2>

      <div className={styles.content}>
        <div className={styles.intersectionsGrid}>
          {intersections.map((intersection) => (
            <IntersectionCard key={intersection.id} intersection={intersection} />
          ))}
        </div>

        <div className={styles.logsPanel}>
          <h3 className={styles.logsTitle}>信号调度操作日志</h3>
          <div className={styles.logsList}>
            {recentLogs.length === 0 ? (
              <p className={styles.emptyLogs}>暂无操作记录</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className={styles.logItem}>
                  <span className={styles.logUser}>{log.username}</span>
                  <span className={styles.logAction}>{log.action}</span>
                  <span className={styles.logTime}>
                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {currentUser && !hasPermission(currentUser, 'operate') && (
        <div className={styles.permissionNotice}>
          您的权限不足，无法操作信号灯。如需操作请联系管理员。
        </div>
      )}
    </div>
  );
}