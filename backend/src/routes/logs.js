const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { logsStore, servicesStore } = require('../utils/store');
const { maskData } = require('../utils/dataMasking');
const { aggregateErrors, generateErrorHash } = require('../utils/errorAggregation');
const { logBuffer } = require('../utils/logBuffer');

const router = new Router();

const LOG_TYPES = {
  DOCKER: 'docker',
  K8S: 'k8s',
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  MINIPROGRAM: 'miniprogram'
};

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

router.post('/ingest', async (ctx) => {
  const { logs, type = 'backend', useBuffer = true } = ctx.request.body;
  
  if (!logs || !Array.isArray(logs)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid logs format. Expected array.' };
    return;
  }
  
  const processedLogs = logs.map(log => {
    const maskedLog = maskData(log);
    
    return {
      id: uuidv4(),
      timestamp: log.timestamp || Date.now(),
      level: (log.level || 'INFO').toUpperCase(),
      message: log.message || '',
      service: log.service || 'unknown',
      type: type,
      traceId: log.traceId || null,
      spanId: log.spanId || null,
      tags: log.tags || {},
      maskedData: maskedLog,
      originalData: log,
      errorHash: log.level === 'ERROR' || log.level === 'FATAL' 
        ? generateErrorHash(log.message || '', log.stack || '') 
        : null
    };
  });
  
  if (useBuffer) {
    logBuffer.add(processedLogs);
    
    ctx.body = {
      success: true,
      received: processedLogs.length,
      buffered: true,
      message: 'Logs buffered successfully'
    };
  } else {
    processedLogs.forEach(log => logsStore.append(log));
    
    ctx.body = {
      success: true,
      received: processedLogs.length,
      buffered: false,
      message: 'Logs ingested successfully'
    };
  }
});

router.get('/buffer/stats', async (ctx) => {
  const stats = logBuffer.getStatistics();
  
  ctx.body = {
    success: true,
    data: stats
  };
});

router.post('/buffer/flush', async (ctx) => {
  await logBuffer.flush();
  
  ctx.body = {
    success: true,
    message: 'Buffer flushed manually'
  };
});

router.post('/buffer/clear', async (ctx) => {
  logBuffer.clear();
  
  ctx.body = {
    success: true,
    message: 'Buffer cleared'
  };
});

router.get('/search', async (ctx) => {
  const { 
    service, 
    level, 
    type,
    traceId,
    keyword,
    startTime,
    endTime,
    limit = 100,
    offset = 0
  } = ctx.query;
  
  let logs = logsStore.read();
  
  if (service) {
    logs = logs.filter(log => log.service === service);
  }
  
  if (level) {
    const levels = Array.isArray(level) ? level : [level];
    logs = logs.filter(log => levels.includes(log.level));
  }
  
  if (type) {
    logs = logs.filter(log => log.type === type);
  }
  
  if (traceId) {
    logs = logs.filter(log => log.traceId === traceId);
  }
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(lowerKeyword) ||
      log.service.toLowerCase().includes(lowerKeyword)
    );
  }
  
  if (startTime) {
    logs = logs.filter(log => log.timestamp >= parseInt(startTime));
  }
  
  if (endTime) {
    logs = logs.filter(log => log.timestamp <= parseInt(endTime));
  }
  
  logs.sort((a, b) => b.timestamp - a.timestamp);
  
  const total = logs.length;
  const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  ctx.body = {
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    data: paginatedLogs
  };
});

router.get('/stats', async (ctx) => {
  const logs = logsStore.read();
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneDayAgo = now - 86400000;
  
  const levelStats = {
    DEBUG: 0,
    INFO: 0,
    WARN: 0,
    ERROR: 0,
    FATAL: 0
  };
  
  const typeStats = {
    docker: 0,
    k8s: 0,
    backend: 0,
    frontend: 0,
    miniprogram: 0
  };
  
  const serviceStats = {};
  const hourStats = Array(60).fill(0);
  const dayStats = Array(24).fill(0);
  
  logs.forEach(log => {
    if (levelStats[log.level] !== undefined) {
      levelStats[log.level]++;
    }
    
    if (typeStats[log.type] !== undefined) {
      typeStats[log.type]++;
    }
    
    if (!serviceStats[log.service]) {
      serviceStats[log.service] = { count: 0, errors: 0 };
    }
    serviceStats[log.service].count++;
    if (log.level === 'ERROR' || log.level === 'FATAL') {
      serviceStats[log.service].errors++;
    }
    
    if (log.timestamp >= oneHourAgo) {
      const minuteIndex = Math.floor((now - log.timestamp) / 60000);
      if (minuteIndex < 60) {
        hourStats[59 - minuteIndex]++;
      }
    }
    
    if (log.timestamp >= oneDayAgo) {
      const hourIndex = Math.floor((now - log.timestamp) / 3600000);
      if (hourIndex < 24) {
        dayStats[23 - hourIndex]++;
      }
    }
  });
  
  const errors = logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL');
  const aggregatedErrors = aggregateErrors(errors, { limit: 10 });
  
  ctx.body = {
    totalLogs: logs.length,
    levelStats,
    typeStats,
    serviceStats,
    hourTrend: hourStats,
    dayTrend: dayStats,
    topErrors: aggregatedErrors.slice(0, 5)
  };
});

router.get('/services', async (ctx) => {
  const services = servicesStore.read();
  ctx.body = { data: services };
});

router.post('/services', async (ctx) => {
  const { name, type, description, metadata } = ctx.request.body;
  
  if (!name) {
    ctx.status = 400;
    ctx.body = { error: 'Service name is required' };
    return;
  }
  
  const existingServices = servicesStore.read();
  const exists = existingServices.find(s => s.name === name);
  
  if (exists) {
    ctx.status = 400;
    ctx.body = { error: 'Service already exists' };
    return;
  }
  
  const service = {
    id: uuidv4(),
    name,
    type: type || 'backend',
    description: description || '',
    metadata: metadata || {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  servicesStore.append(service);
  
  ctx.body = { success: true, data: service };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const logs = logsStore.read();
  const log = logs.find(l => l.id === id);
  
  if (!log) {
    ctx.status = 404;
    ctx.body = { error: 'Log not found' };
    return;
  }
  
  ctx.body = { data: log };
});

module.exports = router;
