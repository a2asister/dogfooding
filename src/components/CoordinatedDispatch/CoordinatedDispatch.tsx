import { useState, useMemo } from 'react';
import { useTrafficStore, hasPermission } from '@/store/trafficStore';
import type { BroadcastMessage, AlarmRecord } from '@/types';
import styles from './CoordinatedDispatch.module.css';

const QUICK_MESSAGES = [
  '前方事故，请绕行',
  '拥堵路段，请耐心等待',
  '道路施工，请减速慢行',
  '紧急车辆通过，请让行',
  '交通管制，请配合',
];

function MessageCard({ message, intersectionName }: { message: BroadcastMessage; intersectionName: string }) {
  const statusLabels: Record<BroadcastMessage['status'], string> = {
    pending: '等待播放',
    playing: '播放中',
    completed: '已完成',
  };

  const statusColors: Record<BroadcastMessage['status'], string> = {
    pending: '#6b7280',
    playing: '#f59e0b',
    completed: '#22c55e',
  };

  return (
    <div className={styles.messageCard}>
      <div className={styles.messageHeader}>
        <span className={styles.intersectionName}>{intersectionName}</span>
        <span
          className={styles.statusBadge}
          style={{ backgroundColor: statusColors[message.status] }}
        >
          {statusLabels[message.status]}
        </span>
      </div>
      <p className={styles.messageContent}>{message.content}</p>
      <span className={styles.messageTime}>
        {new Date(message.timestamp).toLocaleString('zh-CN')}
      </span>
    </div>
  );
}

function AlarmTriggerCard({ alarm, onTrigger }: { alarm: AlarmRecord; onTrigger: () => void }) {
  const canTrigger = hasPermission(useTrafficStore.getState().currentUser, 'operate');

  const typeLabels: Record<AlarmRecord['type'], string> = {
    accident: '交通事故',
    congestion: '道路拥堵',
    illegalParking: '违章停车',
    roadOccupation: '占道施工',
    deviceOffline: '设备离线',
  };

  return (
    <div className={styles.alarmTriggerCard}>
      <div className={styles.alarmInfo}>
        <span className={styles.alarmType}>{typeLabels[alarm.type]}</span>
        <span className={styles.alarmLocation}>
          {alarm.intersectionId || '未知位置'}
        </span>
      </div>
      <button
        className={styles.triggerButton}
        onClick={onTrigger}
        disabled={!canTrigger}
      >
        触发广播
      </button>
    </div>
  );
}

export function CoordinatedDispatch() {
  const intersections = useTrafficStore((state) => state.intersections);
  const alarms = useTrafficStore((state) => state.alarms);
  const broadcastMessages = useTrafficStore((state) => state.broadcastMessages);
  const addBroadcastMessage = useTrafficStore((state) => state.addBroadcastMessage);
  const addOperationLog = useTrafficStore((state) => state.addOperationLog);
  const currentUser = useTrafficStore((state) => state.currentUser);

  const [selectedIntersection, setSelectedIntersection] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  const activeAlarms = useMemo(() => {
    return alarms
      .filter((alarm) => alarm.status !== 'resolved')
      .slice(0, 10);
  }, [alarms]);

  const recentMessages = useMemo(() => {
    return broadcastMessages.slice(0, 10);
  }, [broadcastMessages]);

  const handleQuickBroadcast = (message: string) => {
    if (!selectedIntersection || !currentUser) return;
    addBroadcastMessage(selectedIntersection, message);
    addOperationLog(
      currentUser.id,
      currentUser.username,
      '播放广播',
      '广播系统',
      `在 ${intersections.find((i) => i.id === selectedIntersection)?.name} 播放: ${message}`
    );
  };

  const handleCustomBroadcast = () => {
    if (!selectedIntersection || !customMessage.trim() || !currentUser) return;
    addBroadcastMessage(selectedIntersection, customMessage);
    addOperationLog(
      currentUser.id,
      currentUser.username,
      '播放广播',
      '广播系统',
      `在 ${intersections.find((i) => i.id === selectedIntersection)?.name} 播放: ${customMessage}`
    );
    setCustomMessage('');
  };

  const handleAlarmTrigger = (alarm: AlarmRecord) => {
    if (!alarm.intersectionId || !currentUser) return;
    const message = `紧急通知: ${alarm.description}`;
    addBroadcastMessage(alarm.intersectionId, message);
    addOperationLog(
      currentUser.id,
      currentUser.username,
      '触发语音警报',
      '广播系统',
      `对 ${alarm.intersectionId} 触发语音警报: ${alarm.description}`
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>联动调度</h2>

      <div className={styles.content}>
        <div className={styles.broadcastSection}>
          <h3 className={styles.sectionTitle}>广播控制</h3>

          <div className={styles.intersectionSelector}>
            <label className={styles.selectorLabel}>选择路口:</label>
            <select
              className={styles.select}
              value={selectedIntersection}
              onChange={(e) => setSelectedIntersection(e.target.value)}
            >
              <option value="">请选择路口</option>
              {intersections.map((intersection) => (
                <option key={intersection.id} value={intersection.id}>
                  {intersection.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.quickMessages}>
            <span className={styles.quickLabel}>快捷消息:</span>
            <div className={styles.quickButtons}>
              {QUICK_MESSAGES.map((msg, index) => (
                <button
                  key={index}
                  className={styles.quickButton}
                  onClick={() => handleQuickBroadcast(msg)}
                  disabled={!selectedIntersection}
                >
                  {msg.slice(0, 10)}...
                </button>
              ))}
            </div>
          </div>

          <div className={styles.customMessage}>
            <label className={styles.selectorLabel}>自定义消息:</label>
            <textarea
              className={styles.textarea}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="输入自定义广播内容..."
              rows={3}
            />
            <button
              className={styles.sendButton}
              onClick={handleCustomBroadcast}
              disabled={!selectedIntersection || !customMessage.trim()}
            >
              发送广播
            </button>
          </div>
        </div>

        <div className={styles.alarmSection}>
          <h3 className={styles.sectionTitle}>异常触发</h3>
          <p className={styles.sectionDesc}>
            检测到交通异常时，可触发语音播报警示
          </p>
          <div className={styles.alarmList}>
            {activeAlarms.length === 0 ? (
              <p className={styles.emptyState}>暂无活跃异常</p>
            ) : (
              activeAlarms.map((alarm) => (
                <AlarmTriggerCard
                  key={alarm.id}
                  alarm={alarm}
                  onTrigger={() => handleAlarmTrigger(alarm)}
                />
              ))
            )}
          </div>
        </div>

        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>播放记录</h3>
          <div className={styles.messagesList}>
            {recentMessages.length === 0 ? (
              <p className={styles.emptyState}>暂无播放记录</p>
            ) : (
              recentMessages.map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  intersectionName={
                    intersections.find((i) => i.id === msg.intersectionId)?.name ||
                    '未知路口'
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}