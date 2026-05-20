import * as cron from 'node-cron';
import * as si from 'systeminformation';
import { AppDataSource } from '../config/database';
import { Host } from '../entity/Host';
import { HostMetric } from '../entity/HostMetric';
import { Container } from '../entity/Container';
import { ContainerMetric } from '../entity/ContainerMetric';
import { App } from '../entity/App';
import { AppMetric } from '../entity/AppMetric';
import { Log } from '../entity/Log';

function generateRandomValue(min: number, max: number, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

async function collectHostMetrics() {
  try {
    const hostRepository = AppDataSource.getRepository(Host);
    const metricRepository = AppDataSource.getRepository(HostMetric);
    const hosts = await hostRepository.find({ where: { status: 'online' } });
    const localMetrics = await si.get({
      cpu: 'currentLoad',
      mem: 'total,used',
      fsSize: 'size,used',
      networkStats: 'rx_sec,tx_sec',
      currentLoad: 'currentLoad',
    });
    for (const host of hosts) {
      if (host.ip === '127.0.0.1') {
        const metric = metricRepository.create({
          hostId: host.id,
          cpuUsage: localMetrics.currentLoad.currentload || generateRandomValue(10, 60),
          memoryUsage: ((localMetrics.mem.used / localMetrics.mem.total) * 100) || generateRandomValue(30, 70),
          memoryUsed: (localMetrics.mem.used / 1024 / 1024 / 1024) || generateRandomValue(2, 8),
          diskUsage: localMetrics.fsSize[0] ? (localMetrics.fsSize[0].used / localMetrics.fsSize[0].size) * 100 : generateRandomValue(40, 80),
          diskUsed: localMetrics.fsSize[0] ? (localMetrics.fsSize[0].used / 1024 / 1024 / 1024) : generateRandomValue(50, 200),
          networkIn: localMetrics.networkStats[0] ? (localMetrics.networkStats[0].rx_sec / 1024) : generateRandomValue(100, 5000),
          networkOut: localMetrics.networkStats[0] ? (localMetrics.networkStats[0].tx_sec / 1024) : generateRandomValue(100, 5000),
          loadAverage: generateRandomValue(0.5, 3),
          processCount: generateRandomValue(100, 300, 0),
        });
        await metricRepository.save(metric);
      } else {
        const metric = metricRepository.create({
          hostId: host.id,
          cpuUsage: generateRandomValue(15, 75),
          memoryUsage: generateRandomValue(35, 75),
          memoryUsed: generateRandomValue(2, 12),
          diskUsage: generateRandomValue(45, 85),
          diskUsed: generateRandomValue(50, 300),
          networkIn: generateRandomValue(200, 8000),
          networkOut: generateRandomValue(200, 8000),
          loadAverage: generateRandomValue(0.3, 4),
          processCount: generateRandomValue(80, 350, 0),
        });
        await metricRepository.save(metric);
      }
    }
    console.log(`Collected host metrics for ${hosts.length} hosts`);
  } catch (err) {
    console.error('Error collecting host metrics:', err);
  }
}

async function collectContainerMetrics() {
  try {
    const containerRepository = AppDataSource.getRepository(Container);
    const metricRepository = AppDataSource.getRepository(ContainerMetric);
    const containers = await containerRepository.find({ where: { status: 'running' } });
    for (const container of containers) {
      const metric = metricRepository.create({
        containerId: container.containerId,
        cpuUsage: generateRandomValue(5, 60),
        memoryUsage: generateRandomValue(20, 80),
        memoryUsed: generateRandomValue(0.1, 4),
        networkIn: generateRandomValue(50, 3000),
        networkOut: generateRandomValue(50, 3000),
        diskRead: generateRandomValue(0, 100),
        diskWrite: generateRandomValue(0, 100),
        restartCount: generateRandomValue(0, 5, 0),
      });
      await metricRepository.save(metric);
    }
    console.log(`Collected container metrics for ${containers.length} containers`);
  } catch (err) {
    console.error('Error collecting container metrics:', err);
  }
}

async function collectAppMetrics() {
  try {
    const appRepository = AppDataSource.getRepository(App);
    const metricRepository = AppDataSource.getRepository(AppMetric);
    const apps = await appRepository.find({ where: { status: 'running' } });
    for (const app of apps) {
      const metric = metricRepository.create({
        appCode: app.code,
        cpuUsage: generateRandomValue(10, 70),
        memoryUsage: generateRandomValue(25, 75),
        memoryUsed: generateRandomValue(0.2, 2),
        requestCount: generateRandomValue(10, 1000, 0),
        errorCount: generateRandomValue(0, 10, 0),
        errorRate: generateRandomValue(0, 5),
        avgResponseTime: generateRandomValue(50, 500),
        p95ResponseTime: generateRandomValue(200, 1000),
        p99ResponseTime: generateRandomValue(500, 2000),
        activeConnections: generateRandomValue(5, 200, 0),
        threadCount: generateRandomValue(10, 100, 0),
        heapUsed: generateRandomValue(100, 500),
        heapMax: generateRandomValue(500, 2000),
      });
      await metricRepository.save(metric);
    }
    console.log(`Collected app metrics for ${apps.length} apps`);
  } catch (err) {
    console.error('Error collecting app metrics:', err);
  }
}

async function generateMockLogs() {
  try {
    const logRepository = AppDataSource.getRepository(Log);
    const appRepository = AppDataSource.getRepository(App);
    const apps = await appRepository.find({ where: { status: 'running' } });
    if (apps.length === 0) return;
    const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'DEBUG'];
    const logMessages = [
      'User login successful',
      'Database connection established',
      'Cache invalidated',
      'Request processed',
      'Configuration reloaded',
      'Scheduled task executed',
      'API rate limit reached',
      'Connection timeout',
      'Null pointer exception',
      'Memory usage high warning',
      'Service started successfully',
      'Health check passed',
      'Message sent to queue',
      'File uploaded successfully',
      'Email notification sent',
    ];
    const logs: Log[] = [];
    for (let i = 0; i < generateRandomValue(5, 20, 0); i++) {
      const app = apps[Math.floor(Math.random() * apps.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];
      const log = logRepository.create({
        appCode: app.code,
        env: app.env,
        level,
        logger: 'com.example.service',
        thread: `thread-${generateRandomValue(1, 20, 0)}`,
        message,
        stackTrace: level === 'ERROR' ? `java.lang.Exception: ${message}\n\tat com.example.ServiceClass.method(ServiceClass.java:${generateRandomValue(50, 200, 0)})` : undefined,
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        className: 'com.example.ServiceClass',
        lineNumber: generateRandomValue(50, 200, 0),
        extra: { ip: `192.168.${generateRandomValue(1, 10, 0)}.${generateRandomValue(1, 254, 0)}` },
      });
      logs.push(log);
    }
    await logRepository.save(logs);
    console.log(`Generated ${logs.length} mock logs`);
  } catch (err) {
    console.error('Error generating mock logs:', err);
  }
}

let isCollecting = false;

async function runCollectors() {
  if (isCollecting) return;
  isCollecting = true;
  try {
    await collectHostMetrics();
    await collectContainerMetrics();
    await collectAppMetrics();
  } finally {
    isCollecting = false;
  }
}

export function initDataCollector() {
  setTimeout(() => {
    runCollectors();
    generateMockLogs();
  }, 500);
  cron.schedule('*/30 * * * * *', () => {
    runCollectors();
  });
  cron.schedule('0 * * * * *', () => {
    generateMockLogs();
  });
  console.log('Data collector initialized');
}
