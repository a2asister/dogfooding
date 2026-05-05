const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5560;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const getDB = (fileName) => {
  const filePath = path.join(dataPath, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const saveDB = (fileName, data) => {
  const filePath = path.join(dataPath, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const initData = () => {
  const meters = getDB('meters');
  if (meters.length === 0) {
    const initialMeters = [
      {
        id: 'm1',
        name: '主楼总电表',
        type: 'electric',
        location: '主楼1层',
        status: 'online',
        currentReading: 152345.6,
        baseReading: 150000.0,
        voltage: 220.5,
        current: 45.2,
        power: 9966.6,
        powerFactor: 0.92,
        lastUpdate: moment().toISOString()
      },
      {
        id: 'm2',
        name: '主楼总水表',
        type: 'water',
        location: '主楼1层',
        status: 'online',
        currentReading: 89762.3,
        baseReading: 88000.0,
        flowRate: 2.5,
        pressure: 0.35,
        lastUpdate: moment().toISOString()
      },
      {
        id: 'm3',
        name: '副楼电表',
        type: 'electric',
        location: '副楼2层',
        status: 'online',
        currentReading: 67890.2,
        baseReading: 66000.0,
        voltage: 221.3,
        current: 32.8,
        power: 7258.6,
        powerFactor: 0.90,
        lastUpdate: moment().toISOString()
      },
      {
        id: 'm4',
        name: '主楼楼层电表-2层',
        type: 'electric',
        location: '主楼2层',
        status: 'online',
        currentReading: 45230.8,
        baseReading: 44000.0,
        voltage: 219.8,
        current: 18.5,
        power: 4066.3,
        powerFactor: 0.88,
        lastUpdate: moment().toISOString()
      },
      {
        id: 'm5',
        name: '副楼水表',
        type: 'water',
        location: '副楼1层',
        status: 'online',
        currentReading: 34567.8,
        baseReading: 34000.0,
        flowRate: 1.2,
        pressure: 0.32,
        lastUpdate: moment().toISOString()
      }
    ];
    saveDB('meters', initialMeters);
  }

  const devices = getDB('devices');
  if (devices.length === 0) {
    const initialDevices = [
      {
        id: 'd1',
        name: '中央空调1号',
        type: 'aircondition',
        location: '主楼3层',
        status: 'running',
        power: 2500,
        currentPower: 2450,
        temperature: 24,
        mode: 'cool',
        lastUpdate: moment().toISOString()
      },
      {
        id: 'd2',
        name: '照明系统1区',
        type: 'lighting',
        location: '主楼2层',
        status: 'running',
        power: 800,
        currentPower: 780,
        brightness: 100,
        lastUpdate: moment().toISOString()
      },
      {
        id: 'd3',
        name: '电梯1号',
        type: 'elevator',
        location: '主楼1层',
        status: 'running',
        power: 1500,
        currentPower: 1200,
        currentFloor: 5,
        direction: 'up',
        lastUpdate: moment().toISOString()
      },
      {
        id: 'd4',
        name: '中央空调2号',
        type: 'aircondition',
        location: '副楼2层',
        status: 'stopped',
        power: 2000,
        currentPower: 0,
        temperature: 26,
        mode: 'cool',
        lastUpdate: moment().toISOString()
      },
      {
        id: 'd5',
        name: '通风系统',
        type: 'ventilation',
        location: '主楼地下室',
        status: 'running',
        power: 1000,
        currentPower: 950,
        speed: 80,
        lastUpdate: moment().toISOString()
      }
    ];
    saveDB('devices', initialDevices);
  }

  const energyData = getDB('energyData');
  if (energyData.length === 0) {
    const initialData = [];
    for (let i = 0; i < 24; i++) {
      initialData.push({
        id: `e${i}`,
        timestamp: moment().subtract(23 - i, 'hours').toISOString(),
        electricUsage: 120 + Math.random() * 50,
        waterUsage: 20 + Math.random() * 10,
        peakDemand: 140 + Math.random() * 30,
        averagePower: 110 + Math.random() * 40
      });
    }
    saveDB('energyData', initialData);
  }

  const meterHistory = getDB('meterHistory');
  if (meterHistory.length === 0) {
    const initialHistory = [];
    const meters = getDB('meters');
    for (const meter of meters) {
      for (let i = 0; i < 24; i++) {
        initialHistory.push({
          id: `mh-${meter.id}-${i}`,
          meterId: meter.id,
          meterName: meter.name,
          type: meter.type,
          timestamp: moment().subtract(23 - i, 'hours').toISOString(),
          reading: meter.baseReading + (meter.currentReading - meter.baseReading) * (i / 23) + Math.random() * 5,
          usage: meter.type === 'electric' ? 100 + Math.random() * 50 : 15 + Math.random() * 10,
          voltage: meter.type === 'electric' ? 218 + Math.random() * 6 : null,
          current: meter.type === 'electric' ? 10 + Math.random() * 40 : null,
          flowRate: meter.type === 'water' ? 0.5 + Math.random() * 3 : null,
          pressure: meter.type === 'water' ? 0.25 + Math.random() * 0.15 : null
        });
      }
    }
    saveDB('meterHistory', initialHistory);
  }

  const alerts = getDB('alerts');
  if (alerts.length === 0) {
    const initialAlerts = [
      {
        id: 'a1',
        type: 'warning',
        title: '能耗异常警告',
        message: '主楼3层能耗超出预期值20%',
        source: 'energy',
        sourceId: 'm1',
        timestamp: moment().subtract(2, 'hours').toISOString(),
        resolved: false
      },
      {
        id: 'a2',
        type: 'info',
        title: '设备运行提示',
        message: '中央空调已自动开启节能模式',
        source: 'device',
        sourceId: 'd1',
        timestamp: moment().subtract(4, 'hours').toISOString(),
        resolved: true
      },
      {
        id: 'a3',
        type: 'danger',
        title: '电压异常警告',
        message: '主楼总电表电压波动超出正常范围±5%',
        source: 'meter',
        sourceId: 'm1',
        timestamp: moment().subtract(30, 'minutes').toISOString(),
        resolved: false
      }
    ];
    saveDB('alerts', initialAlerts);
  }
};

initData();

let dataCollectionInterval;
const connectedClients = new Set();

const simulateHardwareDataCollection = () => {
  if (connectedClients.size === 0) {
    console.log('无客户端连接，暂停数据采集');
    return;
  }

  const meters = getDB('meters');
  const devices = getDB('devices');
  const meterHistory = getDB('meterHistory');
  const energyData = getDB('energyData');
  const alerts = getDB('alerts');

  const currentTime = moment().toISOString();

  meters.forEach(meter => {
    const usageIncrement = meter.type === 'electric' 
      ? (0.5 + Math.random() * 1.5) 
      : (0.1 + Math.random() * 0.3);
    
    meter.currentReading += usageIncrement;
    meter.lastUpdate = currentTime;
    
    if (meter.type === 'electric') {
      meter.voltage = 218 + Math.random() * 6;
      meter.current = 10 + Math.random() * 40;
      meter.power = meter.voltage * meter.current;
      meter.powerFactor = 0.85 + Math.random() * 0.15;
    } else if (meter.type === 'water') {
      meter.flowRate = 0.5 + Math.random() * 3;
      meter.pressure = 0.25 + Math.random() * 0.15;
    }

    meterHistory.push({
      id: `mh-${meter.id}-${Date.now()}`,
      meterId: meter.id,
      meterName: meter.name,
      type: meter.type,
      timestamp: currentTime,
      reading: meter.currentReading,
      usage: usageIncrement,
      voltage: meter.type === 'electric' ? meter.voltage : null,
      current: meter.type === 'electric' ? meter.current : null,
      flowRate: meter.type === 'water' ? meter.flowRate : null,
      pressure: meter.type === 'water' ? meter.pressure : null
    });

    if (meter.type === 'electric') {
      if (meter.voltage > 235 || meter.voltage < 205) {
        const existingAlert = alerts.find(a => 
          a.sourceId === meter.id && 
          a.type === 'danger' && 
          !a.resolved &&
          moment().diff(moment(a.timestamp), 'minutes') < 10
        );
        
        if (!existingAlert) {
          alerts.push({
            id: `a-${Date.now()}`,
            type: 'danger',
            title: '电压异常警告',
            message: `${meter.name} 电压异常: ${meter.voltage.toFixed(1)}V (正常范围: 205-235V)`,
            source: 'meter',
            sourceId: meter.id,
            timestamp: currentTime,
            resolved: false
          });
        }
      }
    }
  });

  devices.forEach(device => {
    if (device.status === 'running') {
      device.currentPower = device.power * (0.8 + Math.random() * 0.4);
      
      if (device.type === 'aircondition') {
        device.temperature = 23 + Math.random() * 4;
      } else if (device.type === 'lighting') {
        device.brightness = 50 + Math.random() * 50;
      } else if (device.type === 'elevator') {
        device.currentFloor = Math.floor(Math.random() * 10) + 1;
        device.direction = Math.random() > 0.5 ? 'up' : 'down';
      } else if (device.type === 'ventilation') {
        device.speed = 40 + Math.random() * 60;
      }
    } else {
      device.currentPower = 0;
    }
    device.lastUpdate = currentTime;
  });

  const latestEnergyData = {
    id: `e-${Date.now()}`,
    timestamp: currentTime,
    electricUsage: meters.filter(m => m.type === 'electric').reduce((sum, m) => sum + (m.power / 1000), 0),
    waterUsage: meters.filter(m => m.type === 'water').reduce((sum, m) => sum + (m.flowRate / 60), 0),
    peakDemand: Math.max(...meters.filter(m => m.type === 'electric').map(m => m.power / 1000)),
    averagePower: meters.filter(m => m.type === 'electric').reduce((sum, m) => sum + (m.power / 1000), 0) / meters.filter(m => m.type === 'electric').length
  };

  energyData.push(latestEnergyData);

  while (meterHistory.length > 24 * 60) {
    meterHistory.shift();
  }
  while (energyData.length > 24 * 60) {
    energyData.shift();
  }

  saveDB('meters', meters);
  saveDB('devices', devices);
  saveDB('meterHistory', meterHistory);
  saveDB('energyData', energyData);
  saveDB('alerts', alerts);

  const realtimeData = {
    timestamp: currentTime,
    meters: meters,
    devices: devices,
    energyData: latestEnergyData
  };

  io.emit('realtimeData', realtimeData);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  if (unresolvedAlerts.length > 0) {
    io.emit('alerts', unresolvedAlerts);
  }

  console.log(`[${moment().format('HH:mm:ss')}] 数据采集完成 - 电表: ${meters.length}台, 设备: ${devices.length}台`);
};

io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);
  connectedClients.add(socket.id);

  socket.emit('welcome', { 
    message: '已连接到智慧楼宇能耗智能调度系统',
    timestamp: moment().toISOString()
  });

  const meters = getDB('meters');
  const devices = getDB('devices');
  const energyData = getDB('energyData');
  const meterHistory = getDB('meterHistory');
  const alerts = getDB('alerts');

  socket.emit('initialData', {
    meters,
    devices,
    energyData: energyData.slice(-50),
    meterHistory: meterHistory.slice(-100),
    alerts
  });

  if (connectedClients.size === 1 && !dataCollectionInterval) {
    console.log('启动数据采集定时器');
    dataCollectionInterval = setInterval(simulateHardwareDataCollection, 5000);
    simulateHardwareDataCollection();
  }

  socket.on('requestData', (dataType) => {
    console.log('收到数据请求:', dataType);
    switch (dataType) {
      case 'meters':
        socket.emit('metersData', getDB('meters'));
        break;
      case 'devices':
        socket.emit('devicesData', getDB('devices'));
        break;
      case 'energyData':
        socket.emit('energyData', getDB('energyData').slice(-50));
        break;
      case 'meterHistory':
        socket.emit('meterHistoryData', getDB('meterHistory').slice(-100));
        break;
      case 'alerts':
        socket.emit('alertsData', getDB('alerts'));
        break;
      default:
        socket.emit('error', { message: '未知的数据类型' });
    }
  });

  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    connectedClients.delete(socket.id);
    
    if (connectedClients.size === 0 && dataCollectionInterval) {
      console.log('无客户端连接，停止数据采集');
      clearInterval(dataCollectionInterval);
      dataCollectionInterval = null;
    }
  });
});

app.get('/api/meters', (req, res) => {
  const meters = getDB('meters');
  res.json(meters);
});

app.get('/api/meters/:id', (req, res) => {
  const { id } = req.params;
  const meters = getDB('meters');
  const meter = meters.find(m => m.id === id);
  
  if (!meter) {
    return res.status(404).json({ message: '电表/水表未找到' });
  }
  
  res.json(meter);
});

app.get('/api/meters/:id/history', (req, res) => {
  const { id } = req.params;
  const { limit = 100, period = 'hour' } = req.query;
  const meterHistory = getDB('meterHistory');
  
  let history = meterHistory.filter(h => h.meterId === id);
  
  if (period === 'day') {
    const oneDayAgo = moment().subtract(1, 'day').toISOString();
    history = history.filter(h => h.timestamp >= oneDayAgo);
  } else if (period === 'week') {
    const oneWeekAgo = moment().subtract(1, 'week').toISOString();
    history = history.filter(h => h.timestamp >= oneWeekAgo);
  }
  
  history = history.slice(-parseInt(limit));
  
  res.json(history);
});

app.get('/api/meters/realtime/:id', (req, res) => {
  const { id } = req.params;
  const meters = getDB('meters');
  const meter = meters.find(m => m.id === id);
  
  if (!meter) {
    return res.status(404).json({ message: '电表/水表未找到' });
  }
  
  const meterHistory = getDB('meterHistory');
  const recentHistory = meterHistory
    .filter(h => h.meterId === id)
    .slice(-20);
  
  res.json({
    meter,
    recentHistory,
    timestamp: moment().toISOString()
  });
});

app.get('/api/devices', (req, res) => {
  const devices = getDB('devices');
  res.json(devices);
});

app.put('/api/devices/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const devices = getDB('devices');
  const deviceIndex = devices.findIndex(d => d.id === id);
  
  if (deviceIndex === -1) {
    return res.status(404).json({ message: '设备未找到' });
  }
  
  devices[deviceIndex].status = status;
  devices[deviceIndex].currentPower = status === 'running' ? devices[deviceIndex].power : 0;
  devices[deviceIndex].lastUpdate = moment().toISOString();
  saveDB('devices', devices);
  
  io.emit('deviceStatusChanged', devices[deviceIndex]);
  
  res.json(devices[deviceIndex]);
});

app.put('/api/devices/:id/control', (req, res) => {
  const { id } = req.params;
  const { action, value } = req.body;
  const devices = getDB('devices');
  const deviceIndex = devices.findIndex(d => d.id === id);
  
  if (deviceIndex === -1) {
    return res.status(404).json({ message: '设备未找到' });
  }
  
  const device = devices[deviceIndex];
  
  switch (action) {
    case 'setTemperature':
      if (device.type === 'aircondition') {
        device.temperature = value;
      }
      break;
    case 'setBrightness':
      if (device.type === 'lighting') {
        device.brightness = value;
      }
      break;
    case 'setMode':
      if (device.type === 'aircondition') {
        device.mode = value;
      }
      break;
  }
  
  device.lastUpdate = moment().toISOString();
  saveDB('devices', devices);
  
  io.emit('deviceControlled', device);
  
  res.json(device);
});

app.get('/api/energy-data', (req, res) => {
  const { period = 'day', limit = 50 } = req.query;
  let energyData = getDB('energyData');
  
  if (period === 'day') {
    const oneDayAgo = moment().subtract(1, 'day').toISOString();
    energyData = energyData.filter(d => d.timestamp >= oneDayAgo);
  } else if (period === 'week') {
    const oneWeekAgo = moment().subtract(1, 'week').toISOString();
    energyData = energyData.filter(d => d.timestamp >= oneWeekAgo);
  } else if (period === 'month') {
    const oneMonthAgo = moment().subtract(1, 'month').toISOString();
    energyData = energyData.filter(d => d.timestamp >= oneMonthAgo);
  }
  
  energyData = energyData.slice(-parseInt(limit));
  
  res.json(energyData);
});

app.get('/api/energy-data/realtime', (req, res) => {
  const energyData = getDB('energyData');
  const latestData = energyData.slice(-10);
  
  const meters = getDB('meters');
  const totalElectric = meters
    .filter(m => m.type === 'electric')
    .reduce((sum, m) => sum + (m.power / 1000), 0);
  
  const totalWater = meters
    .filter(m => m.type === 'water')
    .reduce((sum, m) => sum + m.flowRate, 0);
  
  res.json({
    timestamp: moment().toISOString(),
    totalElectric: parseFloat(totalElectric.toFixed(2)),
    totalWater: parseFloat(totalWater.toFixed(2)),
    latestData,
    meters
  });
});

app.get('/api/ai-suggestions', (req, res) => {
  const meters = getDB('meters');
  const devices = getDB('devices');
  
  const suggestions = [];
  
  const runningDevices = devices.filter(d => d.status === 'running');
  const totalPower = runningDevices.reduce((sum, d) => sum + d.currentPower, 0);
  
  if (totalPower > 5000) {
    suggestions.push({
      id: `s-${Date.now()}-1`,
      title: '高能耗警告 - 建议优化部分设备',
      description: `当前总功率消耗 ${(totalPower/1000).toFixed(1)}kW 超出正常范围。建议关闭非必要设备或调整运行模式。`,
      priority: 'high',
      estimatedSaving: Math.round(totalPower * 0.2 / 1000),
      affectedDevices: runningDevices.slice(0, 3).map(d => d.name)
    });
  }
  
  const stoppedAC = devices.find(d => d.type === 'aircondition' && d.status === 'stopped');
  if (stoppedAC) {
    suggestions.push({
      id: `s-${Date.now()}-2`,
      title: '建议开启节能模式',
      description: `${stoppedAC.name} 已停止运行。如果室内温度适宜，建议保持关闭状态以节省能源。`,
      priority: 'low',
      estimatedSaving: 2,
      affectedDevice: stoppedAC.name
    });
  }
  
  const electricMeters = meters.filter(m => m.type === 'electric');
  const avgPowerFactor = electricMeters.reduce((sum, m) => sum + (m.powerFactor || 0), 0) / electricMeters.length;
  
  if (avgPowerFactor < 0.9) {
    suggestions.push({
      id: `s-${Date.now()}-3`,
      title: '功率因数偏低警告',
      description: `当前系统平均功率因数为 ${avgPowerFactor.toFixed(2)}，低于建议值 0.90。建议进行无功补偿优化。`,
      priority: 'medium',
      estimatedSaving: 8,
      recommendation: '考虑安装无功补偿装置'
    });
  }
  
  const defaultSuggestions = [
    {
      id: 's-default-1',
      title: '建议关闭空闲区域照明',
      description: '根据当前人员分布，建议关闭主楼2层西区照明系统，预计节省能耗15%',
      priority: 'high',
      estimatedSaving: 25
    },
    {
      id: 's-default-2',
      title: '中央空调温度优化',
      description: '建议将中央空调温度从24°C调整为26°C，预计节省能耗10%',
      priority: 'medium',
      estimatedSaving: 18
    },
    {
      id: 's-default-3',
      title: '电梯运行优化',
      description: '根据历史数据，建议在非高峰时段减少电梯运行数量',
      priority: 'low',
      estimatedSaving: 8
    }
  ];
  
  const allSuggestions = [...suggestions, ...defaultSuggestions.slice(suggestions.length)];
  
  res.json(allSuggestions);
});

app.get('/api/reports', (req, res) => {
  const { type = 'monthly' } = req.query;
  const meters = getDB('meters');
  const energyData = getDB('energyData');
  
  const totalElectricReading = meters
    .filter(m => m.type === 'electric')
    .reduce((sum, m) => sum + (m.currentReading - m.baseReading), 0);
  
  const totalWaterReading = meters
    .filter(m => m.type === 'water')
    .reduce((sum, m) => sum + (m.currentReading - m.baseReading), 0);
  
  const reports = {
    daily: {
      totalElectric: parseFloat(totalElectricReading.toFixed(1)),
      totalWater: parseFloat(totalWaterReading.toFixed(1)),
      compareYesterday: -5.2,
      peakHour: '14:00-15:00',
      peakDemand: Math.max(...energyData.slice(-12).map(d => d.peakDemand || 0)),
      averagePower: energyData.slice(-12).reduce((sum, d) => sum + (d.averagePower || 0), 0) / 12
    },
    weekly: {
      totalElectric: parseFloat((totalElectricReading * 1.5).toFixed(1)),
      totalWater: parseFloat((totalWaterReading * 1.3).toFixed(1)),
      compareLastWeek: -3.8,
      peakDay: '周三',
      weeklyTrend: ['下降', '持平', '上升', '下降', '下降', '持平', '下降']
    },
    monthly: {
      totalElectric: parseFloat((totalElectricReading * 4).toFixed(1)),
      totalWater: parseFloat((totalWaterReading * 3.5).toFixed(1)),
      compareLastMonth: -2.5,
      trend: 'downward',
      monthlyTarget: 100000,
      currentProgress: (totalElectricReading * 4 / 100000 * 100).toFixed(1)
    }
  };
  
  res.json(reports[type] || reports.monthly);
});

app.get('/api/alerts', (req, res) => {
  const { resolved = 'all', type = 'all' } = req.query;
  let alerts = getDB('alerts');
  
  if (resolved !== 'all') {
    alerts = alerts.filter(a => a.resolved === (resolved === 'true'));
  }
  
  if (type !== 'all') {
    alerts = alerts.filter(a => a.type === type);
  }
  
  res.json(alerts);
});

app.put('/api/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const alerts = getDB('alerts');
  const alertIndex = alerts.findIndex(a => a.id === id);
  
  if (alertIndex === -1) {
    return res.status(404).json({ message: '告警未找到' });
  }
  
  alerts[alertIndex].resolved = true;
  alerts[alertIndex].resolvedAt = moment().toISOString();
  saveDB('alerts', alerts);
  
  io.emit('alertResolved', alerts[alertIndex]);
  
  res.json(alerts[alertIndex]);
});

app.post('/api/alerts', (req, res) => {
  const { type, title, message, source, sourceId } = req.body;
  const alerts = getDB('alerts');
  
  const newAlert = {
    id: `a-${Date.now()}`,
    type: type || 'warning',
    title,
    message,
    source: source || 'system',
    sourceId: sourceId || null,
    timestamp: moment().toISOString(),
    resolved: false
  };
  
  alerts.unshift(newAlert);
  saveDB('alerts', alerts);
  
  io.emit('newAlert', newAlert);
  
  res.status(201).json(newAlert);
});

app.get('/api/dashboard', (req, res) => {
  const meters = getDB('meters');
  const devices = getDB('devices');
  const energyData = getDB('energyData');
  const alerts = getDB('alerts');
  
  const todayElectric = energyData.reduce((sum, data) => sum + (data.electricUsage || 0), 0);
  const todayWater = energyData.reduce((sum, data) => sum + (data.waterUsage || 0), 0);
  
  const activeDevices = devices.filter(d => d.status === 'running').length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  
  const totalPower = meters
    .filter(m => m.type === 'electric')
    .reduce((sum, m) => sum + (m.power || 0), 0);
  
  const totalFlowRate = meters
    .filter(m => m.type === 'water')
    .reduce((sum, m) => sum + (m.flowRate || 0), 0);
  
  res.json({
    todayElectric: Math.round(todayElectric),
    todayWater: Math.round(todayWater),
    activeDevices,
    unresolvedAlerts,
    totalPower: parseFloat((totalPower / 1000).toFixed(2)),
    totalFlowRate: parseFloat(totalFlowRate.toFixed(2)),
    meters,
    devices,
    recentAlerts: alerts.slice(0, 5),
    timestamp: moment().toISOString()
  });
});

app.get('/api/hardware/status', (req, res) => {
  const meters = getDB('meters');
  const devices = getDB('devices');
  
  const hardwareStatus = {
    meters: {
      total: meters.length,
      online: meters.filter(m => m.status === 'online').length,
      offline: meters.filter(m => m.status === 'offline').length,
      details: meters.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        status: m.status,
        reading: m.currentReading,
        lastUpdate: m.lastUpdate
      }))
    },
    devices: {
      total: devices.length,
      running: devices.filter(d => d.status === 'running').length,
      stopped: devices.filter(d => d.status === 'stopped').length,
      details: devices.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        currentPower: d.currentPower,
        lastUpdate: d.lastUpdate
      }))
    },
    dataCollection: {
      status: dataCollectionInterval ? 'active' : 'paused',
      connectedClients: connectedClients.size,
      interval: '5 seconds'
    },
    timestamp: moment().toISOString()
  };
  
  res.json(hardwareStatus);
});

server.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`智慧楼宇能耗智能调度系统`);
  console.log(`==============================================`);
  console.log(`HTTP 服务运行在端口: ${PORT}`);
  console.log(`WebSocket 服务运行在端口: ${PORT}`);
  console.log(`----------------------------------------------`);
  console.log(`API 地址: http://localhost:${PORT}/api`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log(`----------------------------------------------`);
  console.log(`功能模块:`);
  console.log(`  ✓ 水电表智能硬件对接`);
  console.log(`  ✓ 能耗实时数据采集`);
  console.log(`  ✓ WebSocket 实时数据推送`);
  console.log(`  ✓ 历史数据查询 API`);
  console.log(`  ✓ 设备智能控制`);
  console.log(`  ✓ AI 节能建议`);
  console.log(`  ✓ 异常告警管理`);
  console.log(`==============================================`);
});
