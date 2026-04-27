import type {
  Vehicle,
  Driver,
  Order,
  Trip,
  Alert,
  DispatchConfig,
  Passenger,
  ReportData,
  User,
  OperationLog,
  Location,
} from '@/types';

const AREAS = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'];

const generateRandomLocation = (baseLat = 39.9, baseLng = 116.4): Location => ({
  lat: baseLat + (Math.random() - 0.5) * 0.2,
  lng: baseLng + (Math.random() - 0.5) * 0.3,
});

const generateRandomDate = (daysAgo = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

export const generateVehicles = (count = 30): Vehicle[] => {
  const statuses: Vehicle['status'][] = ['online', 'online', 'online', 'online', 'offline', 'maintenance'];
  const operationalStatuses: Vehicle['operationalStatus'][] = ['idle', 'idle', 'operating', 'operating', 'assigned'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    plate: `京${String.fromCharCode(65 + (i % 26))}${String(10000 + i).slice(-5)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    driverId: Math.random() > 0.1 ? (i % 30) + 1 : null,
    location: generateRandomLocation(),
    operationalStatus: operationalStatuses[Math.floor(Math.random() * operationalStatuses.length)],
    battery: Math.floor(Math.random() * 60) + 40,
    area: AREAS[Math.floor(Math.random() * AREAS.length)],
    createdAt: generateRandomDate(30),
    isAbnormal: Math.random() < 0.1,
    abnormalReason: Math.random() < 0.1 ? '续航不足' : undefined,
  }));
};

export const generateDrivers = (count = 30): Driver[] => {
  const statuses: Driver['status'][] = ['on duty', 'on duty', 'on duty', 'off duty', 'on leave'];
  const shifts = ['早班', '中班', '晚班', '夜班'];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[i % names.length]}${i >= names.length ? i : ''}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    orders: Math.floor(Math.random() * 200) + 50,
    rating: Math.floor(Math.random() * 10 + 40) / 10,
    workingHours: Math.floor(Math.random() * 60) + 20,
    violations: Math.floor(Math.random() * 5),
    shift: shifts[Math.floor(Math.random() * shifts.length)],
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    licenseNumber: `A1${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
    isLocked: Math.random() < 0.05,
    isAbnormal: Math.random() < 0.08,
    abnormalReason: Math.random() < 0.08 ? '连续工作超时' : undefined,
  }));
};

export const generateOrders = (count = 50): Order[] => {
  const statuses: Order['status'][] = ['pending', 'assigned', 'accepted', 'in_trip', 'completed', 'cancelled'];
  const priorities: Order['priority'][] = ['high', 'medium', 'medium', 'medium', 'low', 'low'];
  const origins = ['北京西站', '北京站', '北京南站', '首都机场T2', '首都机场T3', '大兴机场'];
  const destinations = ['朝阳区国贸', '海淀区中关村', '东城区王府井', '西城区金融街', '丰台区丽泽'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = generateRandomDate(3);
    const isUrgent = Math.random() < 0.15;
    const isTimeout = Math.random() < 0.1 && status === 'pending';

    return {
      id: i + 1,
      dispatchNumber: `DS${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
      status,
      priority: isUrgent ? 'high' : priorities[Math.floor(Math.random() * priorities.length)],
      origin: origins[Math.floor(Math.random() * origins.length)],
      originLocation: generateRandomLocation(),
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      destinationLocation: generateRandomLocation(),
      distance: Math.floor(Math.random() * 50) + 5,
      estimatedCost: Math.floor(Math.random() * 200) + 30,
      passengerName: `乘客${i + 1}`,
      passengerPhone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      createdAt,
      acceptedAt: status !== 'pending' && status !== 'assigned' ? generateRandomDate(1) : undefined,
      completedAt: status === 'completed' ? generateRandomDate(1) : undefined,
      cancelledAt: status === 'cancelled' ? generateRandomDate(1) : undefined,
      assignedVehicleId: status !== 'pending' ? Math.floor(Math.random() * 30) + 1 : undefined,
      assignedDriverId: status !== 'pending' ? Math.floor(Math.random() * 30) + 1 : undefined,
      isUrgent,
      isTimeout,
      timeoutMinutes: isTimeout ? Math.floor(Math.random() * 30) + 5 : undefined,
    };
  });
};

export const generateTrips = (count = 15): Trip[] => {
  const trafficStatuses: Trip['trafficStatus'][] = ['smooth', 'moderate', 'congested'];

  return Array.from({ length: count }, (_, i) => {
    const route = Array.from({ length: 10 }, () => generateRandomLocation());
    
    return {
      id: i + 1,
      orderId: i + 1,
      dispatchNumber: `DS${new Date().getFullYear()}${String(i + 1).padStart(6, '0')}`,
      vehicleId: (i % 30) + 1,
      driverId: (i % 30) + 1,
      status: i < 3 ? 'abnormal' : i < 5 ? 'completed' : 'in_progress',
      origin: '北京西站',
      destination: '朝阳区国贸',
      currentLocation: route[Math.floor(route.length / 2)],
      route,
      currentSpeed: Math.floor(Math.random() * 80) + 20,
      estimatedArrival: new Date(Date.now() + Math.floor(Math.random() * 3600000)).toISOString(),
      travelTime: Math.floor(Math.random() * 120) + 10,
      trafficStatus: trafficStatuses[Math.floor(Math.random() * trafficStatuses.length)],
      isAbnormal: i < 3,
      abnormalReason: i < 3 ? '车辆异常停靠' : undefined,
      events: [
        {
          id: 1,
          time: generateRandomDate(1),
          type: 'start',
          description: '行程开始',
          location: generateRandomLocation(),
        },
        {
          id: 2,
          time: generateRandomDate(1),
          type: 'checkpoint',
          description: '经过中间站点',
          location: generateRandomLocation(),
        },
      ],
    };
  });
};

export const generateAlerts = (count = 20): Alert[] => {
  const levels: Alert['level'][] = ['info', 'warning', 'warning', 'error', 'critical'];
  const types: Alert['type'][] = [
    'vehicle_offline',
    'trip_abnormal',
    'dispatch_timeout',
    'capacity_insufficient',
    'violation',
    'system',
  ];
  const titles = [
    '车辆离线告警',
    '行程异常',
    '调度超时',
    '运力不足',
    '违规操作',
    '系统异常',
  ];
  const messages = [
    '车辆京A12345已离线超过5分钟',
    '行程DS2024001路线偏离',
    '订单DS2024002派单超时10分钟',
    '朝阳区运力低于警戒阈值',
    '司机张三连续工作超时',
    '数据库连接异常',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    level: levels[Math.floor(Math.random() * levels.length)],
    type: types[i % types.length],
    title: titles[i % titles.length],
    message: messages[i % messages.length],
    createdAt: generateRandomDate(1),
    isRead: Math.random() > 0.5,
    isHandled: Math.random() > 0.7,
    handledBy: Math.random() > 0.7 ? '调度员A' : undefined,
    handledAt: Math.random() > 0.7 ? generateRandomDate(1) : undefined,
    relatedId: Math.floor(Math.random() * 50) + 1,
  }));
};

export const generateDispatchConfig = (): DispatchConfig => ({
  areas: AREAS.map((name, i) => ({
    id: i + 1,
    name,
    code: `AREA_${String(i + 1).padStart(3, '0')}`,
    boundary: [
      generateRandomLocation(),
      generateRandomLocation(),
      generateRandomLocation(),
      generateRandomLocation(),
    ],
    center: generateRandomLocation(),
    isActive: true,
    priority: i + 1,
  })),
  dispatchRules: [
    {
      id: 1,
      name: '距离优先',
      description: '优先派单给距离乘客最近的空闲车辆',
      rule: 'distance < 2km and status = idle',
      isActive: true,
      priority: 1,
    },
    {
      id: 2,
      name: '评分优先',
      description: '同等条件下优先派单给高评分司机',
      rule: 'rating >= 4.5',
      isActive: true,
      priority: 2,
    },
    {
      id: 3,
      name: '区域限制',
      description: '车辆只能在指定区域内接单',
      rule: 'area = passengerArea',
      isActive: false,
      priority: 3,
    },
  ],
  priorityRules: [
    {
      id: 1,
      name: '紧急订单',
      conditions: [{ field: 'isUrgent', operator: 'eq', value: true }],
      weight: 100,
      isActive: true,
    },
    {
      id: 2,
      name: '超时订单',
      conditions: [{ field: 'isTimeout', operator: 'eq', value: true }],
      weight: 80,
      isActive: true,
    },
    {
      id: 3,
      name: '远距离订单',
      conditions: [{ field: 'distance', operator: 'gt', value: 30 }],
      weight: 60,
      isActive: true,
    },
  ],
  capacityThresholds: {
    minimumVehicles: 5,
    warningThreshold: 10,
    criticalThreshold: 5,
    idleVehicleRatio: 0.2,
  },
  alertParameters: [
    {
      id: 1,
      type: 'vehicle_offline',
      name: '车辆离线超时',
      threshold: 5,
      unit: '分钟',
      isEnabled: true,
    },
    {
      id: 2,
      type: 'dispatch_timeout',
      name: '调度超时',
      threshold: 10,
      unit: '分钟',
      isEnabled: true,
    },
    {
      id: 3,
      type: 'driver_overtime',
      name: '司机连续工作',
      threshold: 8,
      unit: '小时',
      isEnabled: true,
    },
  ],
  schedulingStrategies: [
    {
      id: 1,
      name: '早班策略',
      description: '早高峰时段增加运力配置',
      shiftStart: '06:00',
      shiftEnd: '10:00',
      vehicleCount: 25,
      isActive: true,
    },
    {
      id: 2,
      name: '晚班策略',
      description: '晚高峰时段增加运力配置',
      shiftStart: '17:00',
      shiftEnd: '21:00',
      vehicleCount: 30,
      isActive: true,
    },
    {
      id: 3,
      name: '夜间策略',
      description: '夜间时段减少运力配置',
      shiftStart: '22:00',
      shiftEnd: '06:00',
      vehicleCount: 10,
      isActive: true,
    },
  ],
});

export const generatePassengers = (count = 20): Passenger[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `乘客${i + 1}`,
    phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    totalOrders: Math.floor(Math.random() * 100) + 1,
    totalSpent: Math.floor(Math.random() * 5000) + 100,
    rating: Math.floor(Math.random() * 10 + 40) / 10,
    hasComplaints: Math.random() < 0.1,
  }));

export const generateReportData = (): ReportData => ({
  period: '今日',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  capacityStats: {
    totalVehicles: 30,
    onlineVehicles: 24,
    offlineVehicles: 5,
    idleVehicles: 8,
    operatingVehicles: 16,
    averageUtilization: 0.67,
  },
  orderThroughput: {
    totalOrders: 156,
    completedOrders: 142,
    cancelledOrders: 14,
    averageOrderValue: 85,
    peakHourOrders: 45,
    offPeakOrders: 111,
  },
  dispatchEfficiency: {
    averageDispatchTime: 2.5,
    dispatchSuccessRate: 0.92,
    timeoutRate: 0.03,
    reassignmentRate: 0.05,
  },
  driverAttendance: {
    totalDrivers: 30,
    onDuty: 22,
    offDuty: 6,
    onLeave: 2,
    averageWorkingHours: 7.5,
  },
  areaCapacityLoad: AREAS.map((name, i) => ({
    areaName: name,
    totalVehicles: Math.floor(Math.random() * 10) + 2,
    idleVehicles: Math.floor(Math.random() * 5) + 1,
    operatingVehicles: Math.floor(Math.random() * 8) + 2,
    loadRatio: Math.random() * 0.5 + 0.4,
    orders: Math.floor(Math.random() * 50) + 10,
  })),
  peakHours: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orderCount: i >= 7 && i <= 9 ? Math.floor(Math.random() * 20) + 30 : i >= 17 && i <= 19 ? Math.floor(Math.random() * 20) + 25 : Math.floor(Math.random() * 15),
    vehicleCount: 24,
    isPeak: (i >= 7 && i <= 9) || (i >= 17 && i <= 19),
  })),
});

export const generateUsers = (): User[] => [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: 'admin',
    permissions: ['all'],
    phone: '13800138000',
    isActive: true,
    lastLogin: generateRandomDate(1),
  },
  {
    id: 2,
    username: 'dispatcher1',
    name: '调度员甲',
    role: 'dispatcher',
    permissions: ['orders:read', 'orders:dispatch', 'vehicles:read', 'drivers:read'],
    phone: '13800138001',
    isActive: true,
    lastLogin: generateRandomDate(1),
  },
  {
    id: 3,
    username: 'operator1',
    name: '运维人员',
    role: 'operator',
    permissions: ['config:read', 'alerts:read', 'reports:read'],
    phone: '13800138002',
    isActive: true,
    lastLogin: generateRandomDate(2),
  },
];

export const generateOperationLogs = (count = 30): OperationLog[] => {
  const actions = ['登录系统', '派单', '改派', '状态变更', '配置修改', '告警处理', '查询数据', '导出报表'];
  const modules = ['首页', '车辆管理', '司机管理', '订单调度', '行程监控', '调度配置', '消息告警', '系统权限'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    userId: Math.floor(Math.random() * 3) + 1,
    username: ['admin', 'dispatcher1', 'operator1'][Math.floor(Math.random() * 3)],
    action: actions[Math.floor(Math.random() * actions.length)],
    module: modules[Math.floor(Math.random() * modules.length)],
    details: `执行了${actions[Math.floor(Math.random() * actions.length)]}操作`,
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    createdAt: generateRandomDate(7),
    isSensitive: Math.random() < 0.2,
  }));
};

export const mockVehicles = generateVehicles();
export const mockDrivers = generateDrivers();
export const mockOrders = generateOrders();
export const mockTrips = generateTrips();
export const mockAlerts = generateAlerts();
export const mockDispatchConfig = generateDispatchConfig();
export const mockPassengers = generatePassengers();
export const mockReportData = generateReportData();
export const mockUsers = generateUsers();
export const mockOperationLogs = generateOperationLogs();
