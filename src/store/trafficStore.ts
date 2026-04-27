import { create } from 'zustand';
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
  SignalTiming,
  PermissionLevel,
} from '@/types';
import {
  generateRoadSegments,
  generateIntersections,
  generateTrafficFlowData,
  generateAlarms,
  generateDevices,
  generateStatistics,
  generateUsers,
  generateOperationLogs,
  generateBroadcastMessages,
  updateRoadStatus,
  updateSignalState,
} from '@/mock/dataGenerator';

interface TrafficState {
  roads: RoadSegment[];
  intersections: Intersection[];
  trafficFlowData: Map<string, TrafficFlowData[]>;
  alarms: AlarmRecord[];
  devices: Device[];
  statistics: StatisticsData[];
  users: User[];
  operationLogs: OperationLog[];
  broadcastMessages: BroadcastMessage[];
  currentUser: User | null;
  isSimulationRunning: boolean;

  initializeData: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  updateRoadStatuses: () => void;
  updateSignalStates: () => void;
  addAlarm: (alarm: AlarmRecord) => void;
  updateAlarmStatus: (alarmId: string, status: AlarmRecord['status'], handler?: string) => void;
  updateSignalTiming: (intersectionId: string, timing: Partial<SignalTiming>) => void;
  lockSignalTiming: (intersectionId: string, lock: boolean, username: string) => void;
  login: (username: string) => void;
  logout: () => void;
  addOperationLog: (userId: string, username: string, action: string, target: string, details?: string) => void;
  addBroadcastMessage: (intersectionId: string, content: string) => void;
  exportStatistics: (startDate: string, endDate: string) => StatisticsData[];
}

export const useTrafficStore = create<TrafficState>((set, get) => ({
  roads: [],
  intersections: [],
  trafficFlowData: new Map(),
  alarms: [],
  devices: [],
  statistics: [],
  users: [],
  operationLogs: [],
  broadcastMessages: [],
  currentUser: null,
  isSimulationRunning: false,

  initializeData: () => {
    const roads = generateRoadSegments();
    const intersections = generateIntersections();
    const alarms = generateAlarms(25);
    const devices = generateDevices(30);
    const statistics = generateStatistics(30);
    const users = generateUsers();
    const operationLogs = generateOperationLogs(50);
    const broadcastMessages = generateBroadcastMessages();

    const trafficFlowData = new Map<string, TrafficFlowData[]>();
    roads.forEach((road) => {
      trafficFlowData.set(road.id, generateTrafficFlowData(road.id, 24));
    });

    set({
      roads,
      intersections,
      trafficFlowData,
      alarms,
      devices,
      statistics,
      users,
      operationLogs,
      broadcastMessages,
      currentUser: users[0],
    });
  },

  startSimulation: () => {
    set({ isSimulationRunning: true });
  },

  stopSimulation: () => {
    set({ isSimulationRunning: false });
  },

  updateRoadStatuses: () => {
    const { roads } = get();
    const updatedRoads = roads.map((road) => updateRoadStatus(road));
    set({ roads: updatedRoads });
  },

  updateSignalStates: () => {
    const { intersections } = get();
    const updatedIntersections = intersections.map((intersection) =>
      updateSignalState(intersection)
    );
    set({ intersections: updatedIntersections });
  },

  addAlarm: (alarm) => {
    set((state) => ({
      alarms: [alarm, ...state.alarms],
    }));
  },

  updateAlarmStatus: (alarmId, status, handler) => {
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              status,
              处理人: handler ?? alarm.处理人,
              处理时长:
                status === 'resolved'
                  ? Math.floor((Date.now() - alarm.timestamp) / 60000)
                  : alarm.处理时长,
            }
          : alarm
      ),
    }));
  },

  updateSignalTiming: (intersectionId, timing) => {
    const { currentUser } = get();
    set((state) => ({
      intersections: state.intersections.map((intersection) =>
        intersection.id === intersectionId
          ? {
              ...intersection,
              signalTiming: {
                ...intersection.signalTiming,
                ...timing,
                lastModified: Date.now(),
                modifiedBy: currentUser?.username,
              },
            }
          : intersection
      ),
    }));
    const intersection = get().intersections.find((i) => i.id === intersectionId);
    if (intersection && currentUser) {
      get().addOperationLog(
        currentUser.id,
        currentUser.username,
        '调整信号灯配时',
        '信号灯',
        `调整 ${intersection.name} 的信号配时`
      );
    }
  },

  lockSignalTiming: (intersectionId, lock, username) => {
    set((state) => ({
      intersections: state.intersections.map((intersection) =>
        intersection.id === intersectionId
          ? {
              ...intersection,
              signalTiming: {
                ...intersection.signalTiming,
                isLocked: lock,
                lastModified: Date.now(),
                modifiedBy: username,
              },
            }
          : intersection
      ),
    }));
    get().addOperationLog(
      get().currentUser!.id,
      username,
      lock ? '锁定信号参数' : '解锁信号参数',
      '信号灯',
      `${lock ? '锁定' : '解锁'} ${get().intersections.find((i) => i.id === intersectionId)?.name} 的信号参数`
    );
  },

  login: (username) => {
    const { users } = get();
    const user = users.find((u) => u.username === username);
    if (user) {
      set({ currentUser: user });
    }
  },

  logout: () => {
    set({ currentUser: null });
  },

  addOperationLog: (userId, username, action, target, details) => {
    const newLog: OperationLog = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      username,
      action,
      target,
      timestamp: Date.now(),
      details,
    };
    set((state) => ({
      operationLogs: [newLog, ...state.operationLogs].slice(0, 100),
    }));
  },

  addBroadcastMessage: (intersectionId, content) => {
    const newMessage: BroadcastMessage = {
      id: Math.random().toString(36).substring(2, 11),
      intersectionId,
      content,
      timestamp: Date.now(),
      status: 'pending',
    };
    set((state) => ({
      broadcastMessages: [...state.broadcastMessages, newMessage],
    }));
  },

  exportStatistics: (startDate, endDate) => {
    const { statistics } = get();
    return statistics.filter(
      (stat) => stat.date >= startDate && stat.date <= endDate
    );
  },
}));

export function hasPermission(
  user: User | null,
  permission: PermissionLevel
): boolean {
  if (!user) return false;
  const permissionHierarchy: PermissionLevel[] = ['view', 'operate', 'config', 'admin'];
  const userMaxPermissionIndex = Math.max(
    ...user.permissions.map((p) => permissionHierarchy.indexOf(p))
  );
  const requiredIndex = permissionHierarchy.indexOf(permission);
  return userMaxPermissionIndex >= requiredIndex;
}