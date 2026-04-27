import { useEffect, useState } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import {
  RoadMap,
  TrafficFlow,
  SignalControl,
  AlarmPanel,
  EquipmentMonitor,
  StatisticsReview,
  PermissionControl,
  CoordinatedDispatch,
} from '@/components';
import styles from './App.module.css';

type TabType =
  | 'roadmap'
  | 'traffic'
  | 'signal'
  | 'alarm'
  | 'equipment'
  | 'statistics'
  | 'permission'
  | 'dispatch';

const TAB_CONFIG: { key: TabType; label: string }[] = [
  { key: 'roadmap', label: '路况监控' },
  { key: 'traffic', label: '车流统计' },
  { key: 'signal', label: '信号控制' },
  { key: 'alarm', label: '告警管理' },
  { key: 'equipment', label: '设备运维' },
  { key: 'statistics', label: '数据统计' },
  { key: 'permission', label: '权限管理' },
  { key: 'dispatch', label: '联动调度' },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('roadmap');
  const {
    initializeData,
    startSimulation,
    stopSimulation,
    updateRoadStatuses,
    updateSignalStates,
    isSimulationRunning,
    currentUser,
    roads,
    alarms,
    devices,
  } = useTrafficStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (!isSimulationRunning) return;

    const roadInterval = setInterval(() => {
      updateRoadStatuses();
    }, 3000);

    const signalInterval = setInterval(() => {
      updateSignalStates();
    }, 5000);

    return () => {
      clearInterval(roadInterval);
      clearInterval(signalInterval);
    };
  }, [isSimulationRunning, updateRoadStatuses, updateSignalStates]);

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const activeAlarms = alarms.filter((a) => a.status !== 'resolved').length;
  const congestedRoads = roads.filter((r) => r.status === 'congested').length;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>城市交通智能管理系统</h1>
          <span className={styles.userInfo}>
            欢迎, {currentUser?.name || '游客'}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.simButton} ${isSimulationRunning ? styles.stop : styles.start}`}
            onClick={() => (isSimulationRunning ? stopSimulation() : startSimulation())}
          >
            {isSimulationRunning ? '停止模拟' : '开始模拟'}
          </button>
        </div>
      </header>

      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusValue}>{devices.length}</span>
          <span className={styles.statusLabel}>设备总数</span>
        </div>
        <div className={styles.statusItem}>
          <span className={`${styles.statusValue} ${styles.online}`}>{onlineDevices}</span>
          <span className={styles.statusLabel}>在线设备</span>
        </div>
        <div className={styles.statusItem}>
          <span className={`${styles.statusValue} ${activeAlarms > 0 ? styles.warning : ''}`}>
            {activeAlarms}
          </span>
          <span className={styles.statusLabel}>活跃告警</span>
        </div>
        <div className={styles.statusItem}>
          <span className={`${styles.statusValue} ${congestedRoads > 0 ? styles.warning : ''}`}>
            {congestedRoads}
          </span>
          <span className={styles.statusLabel}>拥堵路段</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.navButton} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {activeTab === 'roadmap' && <RoadMap />}
        {activeTab === 'traffic' && <TrafficFlow />}
        {activeTab === 'signal' && <SignalControl />}
        {activeTab === 'alarm' && <AlarmPanel />}
        {activeTab === 'equipment' && <EquipmentMonitor />}
        {activeTab === 'statistics' && <StatisticsReview />}
        {activeTab === 'permission' && <PermissionControl />}
        {activeTab === 'dispatch' && <CoordinatedDispatch />}
      </main>
    </div>
  );
}

export default Dashboard;