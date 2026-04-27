import type {
  RoadSegment,
  Intersection,
  TrafficFlowData,
  AlarmRecord,
  Device,
  StatisticsData,
  User,
  OperationLog,
  BroadcastMessage,
  SignalState,
  RoadStatus,
  AlarmLevel,
  AlarmType,
  DeviceStatus,
} from '@/types';

const INTERSECTION_COORDINATES: { name: string; x: number; y: number }[] = [
  { name: '人民路-解放路路口', x: 150, y: 150 },
  { name: '人民路-建设路路口', x: 400, y: 150 },
  { name: '人民路-文化路路口', x: 650, y: 150 },
  { name: '解放路-和平路路口', x: 150, y: 350 },
  { name: '解放路-胜利路路口', x: 400, y: 350 },
  { name: '建设路-和平路路口', x: 150, y: 550 },
  { name: '建设路-胜利路路口', x: 400, y: 550 },
  { name: '文化路-和平路路口', x: 650, y: 350 },
  { name: '文化路-胜利路路口', x: 850, y: 350 },
  { name: '和平路-友谊路路口', x: 650, y: 550 },
];

interface RoadDefinition {
  id: string;
  name: string;
  startIntersectionIdx: number;
  endIntersectionIdx: number;
  lanes: number;
}

const ROAD_DEFINITIONS: RoadDefinition[] = [
  { id: 'road-1', name: '人民路', startIntersectionIdx: 0, endIntersectionIdx: 1, lanes: 4 },
  { id: 'road-2', name: '人民路', startIntersectionIdx: 1, endIntersectionIdx: 2, lanes: 4 },
  { id: 'road-3', name: '解放路', startIntersectionIdx: 0, endIntersectionIdx: 3, lanes: 3 },
  { id: 'road-4', name: '解放路', startIntersectionIdx: 3, endIntersectionIdx: 5, lanes: 3 },
  { id: 'road-5', name: '建设路', startIntersectionIdx: 1, endIntersectionIdx: 4, lanes: 4 },
  { id: 'road-6', name: '建设路', startIntersectionIdx: 4, endIntersectionIdx: 6, lanes: 4 },
  { id: 'road-7', name: '文化路', startIntersectionIdx: 2, endIntersectionIdx: 7, lanes: 3 },
  { id: 'road-8', name: '文化路', startIntersectionIdx: 7, endIntersectionIdx: 9, lanes: 3 },
  { id: 'road-9', name: '和平路', startIntersectionIdx: 3, endIntersectionIdx: 7, lanes: 3 },
  { id: 'road-10', name: '胜利路', startIntersectionIdx: 4, endIntersectionIdx: 8, lanes: 4 },
  { id: 'road-11', name: '友谊路', startIntersectionIdx: 5, endIntersectionIdx: 9, lanes: 2 },
  { id: 'road-12', name: '振兴路', startIntersectionIdx: 6, endIntersectionIdx: 9, lanes: 2 },
];

function randomId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStatus(): RoadStatus {
  const statuses: RoadStatus[] = ['normal', 'congested', 'blocked', 'unknown'];
  const weights = [0.6, 0.25, 0.1, 0.05];
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return statuses[i];
  }
  return 'normal';
}

function randomSignalState(): SignalState {
  const states: SignalState[] = ['red', 'green', 'yellow'];
  return states[randomInRange(0, 2)];
}

function randomAlarmLevel(): AlarmLevel {
  const levels: AlarmLevel[] = ['low', 'medium', 'high', 'critical'];
  const weights = [0.4, 0.35, 0.2, 0.05];
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return levels[i];
  }
  return 'low';
}

function randomAlarmType(): AlarmType {
  const types: AlarmType[] = ['accident', 'congestion', 'illegalParking', 'roadOccupation', 'deviceOffline'];
  return types[randomInRange(0, types.length - 1)];
}

function randomDeviceStatus(): DeviceStatus {
  const statuses: DeviceStatus[] = ['online', 'offline', 'fault', 'maintenance'];
  const weights = [0.8, 0.1, 0.07, 0.03];
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return statuses[i];
  }
  return 'online';
}

export function generateRoadSegments(): RoadSegment[] {
  return ROAD_DEFINITIONS.map((def) => {
    const startCoord = INTERSECTION_COORDINATES[def.startIntersectionIdx];
    const endCoord = INTERSECTION_COORDINATES[def.endIntersectionIdx];
    return {
      id: def.id,
      name: def.name,
      startPoint: { x: startCoord.x, y: startCoord.y },
      endPoint: { x: endCoord.x, y: endCoord.y },
      lanes: def.lanes,
      status: randomStatus(),
      speedLimit: randomInRange(40, 80),
      currentSpeed: randomInRange(20, 80),
      trafficDensity: Math.random(),
    };
  });
}

export function generateIntersections(): Intersection[] {
  return INTERSECTION_COORDINATES.map((coord, i) => {
    const connectedRoads = ROAD_DEFINITIONS
      .filter((def) => def.startIntersectionIdx === i || def.endIntersectionIdx === i)
      .map((def) => def.id);

    return {
      id: `intersection-${i + 1}`,
      name: coord.name,
      coordinate: { x: coord.x, y: coord.y },
      roads: connectedRoads,
      signalState: randomSignalState(),
      signalTiming: {
        redDuration: randomInRange(30, 90),
        greenDuration: randomInRange(30, 90),
        yellowDuration: randomInRange(3, 8),
        isLocked: Math.random() < 0.1,
        lastModified: Date.now() - randomInRange(0, 86400000),
      },
    };
  });
}

export function generateTrafficFlowData(roadId: string, hours: number = 24): TrafficFlowData[] {
  const now = Date.now();
  const hourMs = 3600000;
  return Array.from({ length: hours }, (_, hour) => {
    const isPeakMorning = hour >= 7 && hour <= 9;
    const isPeakEvening = hour >= 17 && hour <= 19;
    const baseVolume = isPeakMorning || isPeakEvening
      ? randomInRange(800, 1500)
      : randomInRange(200, 600);
    return {
      timestamp: now - (hours - hour) * hourMs,
      roadId,
      volume: baseVolume,
      avgSpeed: randomInRange(20, 80),
      density: Math.random(),
    };
  });
}

export function generateAlarms(count: number = 20): AlarmRecord[] {
  return Array.from({ length: count }, () => {
    const timestamp = Date.now() - randomInRange(0, 86400000 * 7);
    const status: AlarmRecord['status'] = Math.random() < 0.6
      ? 'resolved'
      : Math.random() < 0.5
        ? 'processing'
        : 'pending';
    const intersectionIdx = randomInRange(0, INTERSECTION_COORDINATES.length - 1);
    const coord = INTERSECTION_COORDINATES[intersectionIdx];
    return {
      id: randomId(),
      type: randomAlarmType(),
      level: randomAlarmLevel(),
      location: { x: coord.x + randomInRange(-30, 30), y: coord.y + randomInRange(-30, 30) },
      intersectionId: `intersection-${intersectionIdx + 1}`,
      description: getAlarmDescription(randomAlarmType()),
      timestamp,
      status,
      处理时长: status === 'resolved' ? randomInRange(5, 120) : undefined,
      处理人: status === 'resolved' ? `操作员${randomInRange(1, 10)}` : undefined,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

function getAlarmDescription(type: AlarmType): string {
  const descriptions: Record<AlarmType, string> = {
    accident: '交通事故发生',
    congestion: '道路严重拥堵',
    illegalParking: '发现违章停车',
    roadOccupation: '发现占道施工',
    deviceOffline: '设备离线告警',
  };
  return descriptions[type];
}

export function generateDevices(count: number = 30): Device[] {
  const types: Device['type'][] = ['trafficLight', 'camera', 'magneticSensor'];
  return Array.from({ length: count }, (_, i) => {
    const type = types[i % 3];
    const intersectionIdx = i % INTERSECTION_COORDINATES.length;
    const baseCoord = INTERSECTION_COORDINATES[intersectionIdx];
    return {
      id: `device-${i + 1}`,
      type,
      name: `${type === 'trafficLight' ? '信号灯' : type === 'camera' ? '摄像头' : '地磁传感器'}-${i + 1}`,
      location: { x: baseCoord.x + randomInRange(-20, 20), y: baseCoord.y + randomInRange(-20, 20) },
      intersectionId: `intersection-${intersectionIdx + 1}`,
      status: randomDeviceStatus(),
      lastHeartbeat: Date.now() - randomInRange(0, 300000),
      batteryLevel: type === 'magneticSensor' ? randomInRange(20, 100) : undefined,
      signalDelay: randomInRange(10, 500),
      faultCount: randomInRange(0, 5),
      maintenanceRecords: [],
    };
  });
}

export function generateStatistics(days: number = 7): StatisticsData[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split('T')[0],
      totalTrafficVolume: randomInRange(50000, 150000),
      congestionDuration: randomInRange(60, 300),
      alarmCount: randomInRange(5, 30),
      deviceFaultCount: randomInRange(1, 10),
      signalSchedulingCount: randomInRange(10, 50),
    };
  });
}

export function generateUsers(): User[] {
  return [
    {
      id: 'user-1',
      username: 'admin',
      name: '系统管理员',
      permissions: ['view', 'operate', 'config', 'admin'],
      lastLogin: Date.now() - randomInRange(0, 86400000),
    },
    {
      id: 'user-2',
      username: 'operator',
      name: '值班员',
      permissions: ['view', 'operate'],
      lastLogin: Date.now() - randomInRange(0, 86400000),
    },
    {
      id: 'user-3',
      username: 'viewer',
      name: '观察员',
      permissions: ['view'],
      lastLogin: Date.now() - randomInRange(0, 86400000),
    },
  ];
}

export function generateOperationLogs(count: number = 50): OperationLog[] {
  const actions = [
    { action: '调整信号灯配时', target: '信号灯' },
    { action: '锁定信号参数', target: '信号灯' },
    { action: '处理告警', target: '告警' },
    { action: '导出数据', target: '统计数据' },
    { action: '修改设备参数', target: '设备' },
    { action: '播放广播', target: '广播系统' },
  ];
  return Array.from({ length: count }, () => {
    const op = actions[randomInRange(0, actions.length - 1)];
    return {
      id: randomId(),
      userId: `user-${randomInRange(1, 3)}`,
      username: ['admin', 'operator', 'viewer'][randomInRange(0, 2)],
      action: op.action,
      target: op.target,
      timestamp: Date.now() - randomInRange(0, 86400000 * 7),
      details: `对 ${op.target} 执行了 ${op.action} 操作`,
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
}

export function generateBroadcastMessages(): BroadcastMessage[] {
  return [
    {
      id: randomId(),
      intersectionId: 'intersection-1',
      content: '前方事故，请绕行',
      timestamp: Date.now() - randomInRange(0, 3600000),
      status: 'completed',
    },
    {
      id: randomId(),
      intersectionId: 'intersection-2',
      content: '拥堵路段，请耐心等待',
      timestamp: Date.now() - randomInRange(0, 1800000),
      status: 'playing',
    },
  ];
}

export function updateRoadStatus(road: RoadSegment): RoadSegment {
  const newStatus = randomStatus();
  return {
    ...road,
    status: newStatus,
    currentSpeed: newStatus === 'blocked' ? 0 : randomInRange(20, 80),
    trafficDensity: newStatus === 'congested' ? 0.8 + Math.random() * 0.2 : Math.random() * 0.5,
  };
}

export function updateSignalState(intersection: Intersection): Intersection {
  if (intersection.signalTiming.isLocked) {
    return intersection;
  }
  const states: SignalState[] = ['red', 'green', 'yellow'];
  const currentIndex = states.indexOf(intersection.signalState);
  const nextIndex = (currentIndex + 1) % states.length;
  return {
    ...intersection,
    signalState: states[nextIndex],
  };
}