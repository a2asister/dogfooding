const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname);

const dataFiles = {
  animals: path.join(dataDir, 'animals.json'),
  venues: path.join(dataDir, 'venues.json'),
  crowds: path.join(dataDir, 'crowds.json'),
  environments: path.join(dataDir, 'environments.json'),
  security: path.join(dataDir, 'security.json'),
  devices: path.join(dataDir, 'devices.json'),
  alerts: path.join(dataDir, 'alerts.json'),
  users: path.join(dataDir, 'users.json'),
  operationLogs: path.join(dataDir, 'operationLogs.json'),
  feedingRecords: path.join(dataDir, 'feedingRecords.json')
};

const defaultData = {
  animals: [
    { id: 'a1', name: '大熊猫团团', species: '大熊猫', venueId: 'v1', status: '正常', health: 95, lastCheck: '2026-04-30T10:00:00Z', age: 5, gender: '雄性' },
    { id: 'a2', name: '大熊猫圆圆', species: '大熊猫', venueId: 'v1', status: '正常', health: 92, lastCheck: '2026-04-30T10:00:00Z', age: 4, gender: '雌性' },
    { id: 'a3', name: '非洲狮辛巴', species: '非洲狮', venueId: 'v2', status: '正常', health: 88, lastCheck: '2026-04-30T09:30:00Z', age: 7, gender: '雄性' },
    { id: 'a4', name: '长颈鹿壮壮', species: '长颈鹿', venueId: 'v3', status: '正常', health: 90, lastCheck: '2026-04-30T09:00:00Z', age: 3, gender: '雄性' },
    { id: 'a5', name: '企鹅宝宝', species: '帝企鹅', venueId: 'v4', status: '正常', health: 93, lastCheck: '2026-04-30T08:30:00Z', age: 2, gender: '雌性' }
  ],
  venues: [
    { id: 'v1', name: '熊猫馆', location: '东区A区', capacity: 50, currentVisitors: 32, status: '开放', description: '大熊猫专属展区' },
    { id: 'v2', name: '猛兽区', location: '西区B区', capacity: 100, currentVisitors: 45, status: '开放', description: '狮子、老虎等猛兽展区' },
    { id: 'v3', name: '草食动物区', location: '北区C区', capacity: 150, currentVisitors: 89, status: '开放', description: '长颈鹿、斑马等草食动物展区' },
    { id: 'v4', name: '极地馆', location: '南区D区', capacity: 80, currentVisitors: 56, status: '开放', description: '企鹅、北极熊等极地动物展区' },
    { id: 'v5', name: '海洋馆', location: '中心区E区', capacity: 200, currentVisitors: 120, status: '开放', description: '海洋生物展区' }
  ],
  crowds: [
    { id: 'c1', time: '2026-04-30T14:00:00Z', totalVisitors: 1234, density: 0.65, peakHour: '10:00-11:00', predictions: [
      { hour: '15:00', visitors: 1100 },
      { hour: '16:00', visitors: 900 },
      { hour: '17:00', visitors: 500 }
    ]}
  ],
  environments: [
    { id: 'e1', venueId: 'v1', temperature: 24.5, humidity: 65, co2: 450, pm25: 12, timestamp: '2026-04-30T14:00:00Z' },
    { id: 'e2', venueId: 'v2', temperature: 22.3, humidity: 55, co2: 420, pm25: 15, timestamp: '2026-04-30T14:00:00Z' },
    { id: 'e3', venueId: 'v3', temperature: 25.1, humidity: 60, co2: 480, pm25: 18, timestamp: '2026-04-30T14:00:00Z' },
    { id: 'e4', venueId: 'v4', temperature: -2.5, humidity: 75, co2: 380, pm25: 8, timestamp: '2026-04-30T14:00:00Z' },
    { id: 'e5', venueId: 'v5', temperature: 26.0, humidity: 80, co2: 520, pm25: 10, timestamp: '2026-04-30T14:00:00Z' }
  ],
  security: [
    { id: 's1', name: '正门入口摄像头', location: '正门', status: '在线', lastUpdate: '2026-04-30T14:00:00Z' },
    { id: 's2', name: '熊猫馆监控1', location: '熊猫馆', status: '在线', lastUpdate: '2026-04-30T14:00:00Z' },
    { id: 's3', name: '猛兽区监控', location: '猛兽区', status: '在线', lastUpdate: '2026-04-30T14:00:00Z' },
    { id: 's4', name: '停车场监控', location: '停车场', status: '离线', lastUpdate: '2026-04-30T12:30:00Z' }
  ],
  devices: [
    { id: 'd1', name: '环境监测仪-熊猫馆', type: '环境监测', status: '正常', lastCheck: '2026-04-30T14:00:00Z' },
    { id: 'd2', name: '智能门禁-正门', type: '门禁', status: '正常', lastCheck: '2026-04-30T14:00:00Z' },
    { id: 'd3', name: '喂食器-猛兽区', type: '喂食设备', status: '维护中', lastCheck: '2026-04-30T12:00:00Z' },
    { id: 'd4', name: '温控系统-极地馆', type: '温控', status: '正常', lastUpdate: '2026-04-30T14:00:00Z' }
  ],
  alerts: [
    { id: 'al1', type: '环境超标', severity: '警告', venueId: 'v3', message: '草食动物区PM2.5值偏高', status: '未处理', createdAt: '2026-04-30T13:45:00Z' },
    { id: 'al2', type: '设备故障', severity: '紧急', venueId: 'v2', message: '喂食器-猛兽区需要维护', status: '处理中', createdAt: '2026-04-30T12:15:00Z' },
    { id: 'al3', type: '人员拥堵', severity: '提醒', venueId: 'v5', message: '海洋馆游客接近最大容量', status: '未处理', createdAt: '2026-04-30T13:30:00Z' }
  ],
  users: [
    { id: 'u1', username: 'admin', password: 'admin123', role: '管理员', name: '张管理员', department: '运营部', status: '正常' },
    { id: 'u2', username: 'security', password: 'security123', role: '安保人员', name: '李安保', department: '安保部', status: '正常' },
    { id: 'u3', username: 'keeper', password: 'keeper123', role: '饲养员', name: '王饲养员', department: '动物养护部', status: '正常' }
  ],
  operationLogs: [
    { id: 'ol1', userId: 'u1', action: '登录系统', details: { ip: '192.168.1.100' }, timestamp: '2026-04-30T09:00:00Z' },
    { id: 'ol2', userId: 'u3', action: '查看动物状态', details: { animalId: 'a1' }, timestamp: '2026-04-30T10:00:00Z' },
    { id: 'ol3', userId: 'u2', action: '处理告警', details: { alertId: 'al2' }, timestamp: '2026-04-30T12:30:00Z' }
  ],
  feedingRecords: [
    { id: 'f1', animalId: 'a1', feederId: 'u3', food: '新鲜竹子', quantity: '5kg', time: '2026-04-30T08:00:00Z', notes: '正常进食' },
    { id: 'f2', animalId: 'a3', feederId: 'u3', food: '新鲜牛肉', quantity: '3kg', time: '2026-04-30T11:00:00Z', notes: '正常进食' },
    { id: 'f3', animalId: 'a2', feederId: 'u3', food: '新鲜竹子', quantity: '4kg', time: '2026-04-30T14:00:00Z', notes: '正常进食' }
  ]
};

function loadData(filePath, defaultItems) {
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return data;
    } catch (err) {
      console.error(`读取数据文件失败: ${filePath}`, err);
      return defaultItems;
    }
  }
  return defaultItems;
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`保存数据文件失败: ${filePath}`, err);
  }
}

const database = {
  animals: loadData(dataFiles.animals, defaultData.animals),
  venues: loadData(dataFiles.venues, defaultData.venues),
  crowds: loadData(dataFiles.crowds, defaultData.crowds),
  environments: loadData(dataFiles.environments, defaultData.environments),
  security: loadData(dataFiles.security, defaultData.security),
  devices: loadData(dataFiles.devices, defaultData.devices),
  alerts: loadData(dataFiles.alerts, defaultData.alerts),
  users: loadData(dataFiles.users, defaultData.users),
  operationLogs: loadData(dataFiles.operationLogs, defaultData.operationLogs),
  feedingRecords: loadData(dataFiles.feedingRecords, defaultData.feedingRecords),
  
  saveAll: () => {
    saveData(dataFiles.animals, database.animals);
    saveData(dataFiles.venues, database.venues);
    saveData(dataFiles.crowds, database.crowds);
    saveData(dataFiles.environments, database.environments);
    saveData(dataFiles.security, database.security);
    saveData(dataFiles.devices, database.devices);
    saveData(dataFiles.alerts, database.alerts);
    saveData(dataFiles.users, database.users);
    saveData(dataFiles.operationLogs, database.operationLogs);
    saveData(dataFiles.feedingRecords, database.feedingRecords);
  },
  
  generateId: () => uuidv4()
};

database.saveAll();

module.exports = database;
