import cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { Trace } from '../entity/Trace';
import { Span } from '../entity/Span';
import { ServiceDependency } from '../entity/ServiceDependency';
import { ApiMetric } from '../entity/ApiMetric';
import { Log } from '../entity/Log';
import { AlertChannel } from '../entity/AlertChannel';
import { AlertConvergence } from '../entity/AlertConvergence';
import dayjs from 'dayjs';

const services = [
  { name: 'admin-web', type: 'frontend', ip: '10.0.1.10', port: 80 },
  { name: 'api-gateway', type: 'gateway', ip: '10.0.1.20', port: 8080 },
  { name: 'user-service', type: 'service', ip: '10.0.2.10', port: 8081 },
  { name: 'order-service', type: 'service', ip: '10.0.2.20', port: 8082 },
  { name: 'payment-gateway', type: 'service', ip: '10.0.2.30', port: 8083 },
  { name: 'mq-service', type: 'mq', ip: '10.0.3.10', port: 9092 },
  { name: 'mysql-master', type: 'database', ip: '10.0.4.10', port: 3306 },
  { name: 'redis-cache', type: 'cache', ip: '10.0.4.20', port: 6379 },
  { name: 'elasticsearch', type: 'database', ip: '10.0.4.30', port: 9200 },
];

const apis = [
  { method: 'GET', path: '/api/users/:id', appCode: 'user-service' },
  { method: 'POST', path: '/api/users', appCode: 'user-service' },
  { method: 'PUT', path: '/api/users/:id', appCode: 'user-service' },
  { method: 'GET', path: '/api/orders', appCode: 'order-service' },
  { method: 'POST', path: '/api/orders', appCode: 'order-service' },
  { method: 'GET', path: '/api/orders/:id', appCode: 'order-service' },
  { method: 'POST', path: '/api/payments', appCode: 'payment-gateway' },
  { method: 'GET', path: '/api/payments/:id', appCode: 'payment-gateway' },
];

const serviceDependencies = [
  { caller: 'admin-web', callee: 'api-gateway', callType: 'HTTP' },
  { caller: 'api-gateway', callee: 'user-service', callType: 'HTTP' },
  { caller: 'api-gateway', callee: 'order-service', callType: 'HTTP' },
  { caller: 'api-gateway', callee: 'payment-gateway', callType: 'HTTP' },
  { caller: 'user-service', callee: 'mysql-master', callType: 'DB' },
  { caller: 'user-service', callee: 'redis-cache', callType: 'CACHE' },
  { caller: 'order-service', callee: 'mysql-master', callType: 'DB' },
  { caller: 'order-service', callee: 'redis-cache', callType: 'CACHE' },
  { caller: 'order-service', callee: 'mq-service', callType: 'MQ' },
  { caller: 'payment-gateway', callee: 'mysql-master', callType: 'DB' },
  { caller: 'payment-gateway', callee: 'elasticsearch', callType: 'DB' },
  { caller: 'mq-service', callee: 'elasticsearch', callType: 'DB' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateTraceData() {
  const traceRepository = AppDataSource.getRepository(Trace);
  const spanRepository = AppDataSource.getRepository(Span);
  const logRepository = AppDataSource.getRepository(Log);

  for (let i = 0; i < randomInt(5, 15); i++) {
    const traceId = generateId();
    const userId = `user_${randomInt(1, 1000)}`;
    const api = randomChoice(apis);
    const env = randomChoice(['prod', 'prod', 'prod', 'test', 'pre']);
    const hasError = Math.random() < 0.1;
    const statusCode = hasError ? randomChoice([400, 401, 403, 404, 500, 502, 503]) : randomChoice([200, 200, 200, 201, 204]);

    const spans: Span[] = [];
    let spanStartTime = Date.now() - randomInt(100, 5000);

    const rootSpanId = generateId();
    const gatewaySpanId = generateId();
    const serviceSpanId = generateId();

    const rootService = services.find((s) => s.name === 'admin-web')!;
    spans.push({
      traceId,
      spanId: rootSpanId,
      parentSpanId: undefined,
      serviceName: rootService.name,
      serviceType: rootService.type,
      serviceIp: rootService.ip,
      servicePort: rootService.port,
      name: `${api.method} ${api.path}`,
      kind: 'CLIENT',
      startTime: spanStartTime,
      endTime: spanStartTime + randomInt(50, 200),
      duration: randomInt(50, 200),
      hasError: false,
      protocol: 'HTTP',
      component: 'browser',
      callType: 'sync',
      region: 'cn-hangzhou',
      requestParams: { userId, page: randomInt(1, 10) },
      responseData: { code: 0, message: 'success' },
      attributes: { browser: 'Chrome', os: 'Windows' },
    } as Span);

    spanStartTime += randomInt(10, 50);

    const gatewayService = services.find((s) => s.name === 'api-gateway')!;
    spans.push({
      traceId,
      spanId: gatewaySpanId,
      parentSpanId: rootSpanId,
      serviceName: gatewayService.name,
      serviceType: gatewayService.type,
      serviceIp: gatewayService.ip,
      servicePort: gatewayService.port,
      name: `route ${api.path}`,
      kind: 'SERVER',
      startTime: spanStartTime,
      endTime: spanStartTime + randomInt(20, 100),
      duration: randomInt(20, 100),
      hasError: false,
      protocol: 'HTTP',
      component: 'gateway',
      callType: 'sync',
      region: 'cn-hangzhou',
      attributes: { routeRule: 'default' },
    } as Span);

    spanStartTime += randomInt(5, 20);

    const targetService = services.find((s) => s.name === api.appCode)!;
    const serviceDuration = randomInt(50, 500);
    spans.push({
      traceId,
      spanId: serviceSpanId,
      parentSpanId: gatewaySpanId,
      serviceName: targetService.name,
      serviceType: targetService.type,
      serviceIp: targetService.ip,
      servicePort: targetService.port,
      name: `${api.method} ${api.path}`,
      kind: 'SERVER',
      startTime: spanStartTime,
      endTime: spanStartTime + serviceDuration,
      duration: serviceDuration,
      hasError,
      errorMessage: hasError ? randomChoice(['Database connection timeout', 'Null pointer exception', 'Invalid parameter', 'Service unavailable']) : undefined,
      stackTrace: hasError ? 'java.lang.NullPointerException\n\tat com.example.service.UserService.getUser(UserService.java:123)' : undefined,
      protocol: 'HTTP',
      component: 'spring-mvc',
      callType: 'sync',
      region: 'cn-hangzhou',
      requestParams: { id: randomInt(1, 1000) },
      responseData: hasError ? { code: 500, message: 'Internal server error' } : { code: 0, data: { id: randomInt(1, 1000) } },
      attributes: { requestId: generateId() },
    } as Span);

    if (Math.random() > 0.3) {
      const dbSpanId = generateId();
      const dbService = services.find((s) => s.name === 'mysql-master')!;
      const dbDuration = randomInt(10, 100);
      spans.push({
        traceId,
        spanId: dbSpanId,
        parentSpanId: serviceSpanId,
        serviceName: dbService.name,
        serviceType: dbService.type,
        serviceIp: dbService.ip,
        servicePort: dbService.port,
        name: randomChoice(['SELECT * FROM users WHERE id = ?', 'INSERT INTO orders SET ?', 'UPDATE users SET ? WHERE id = ?']),
        kind: 'CLIENT',
        startTime: spanStartTime + randomInt(10, 50),
        endTime: spanStartTime + randomInt(10, 50) + dbDuration,
        duration: dbDuration,
        hasError: false,
        protocol: 'MYSQL',
        component: 'mysql-connector',
        dbType: 'mysql',
        dbStatement: 'SELECT * FROM users WHERE id = ?',
        callType: 'sync',
        region: 'cn-hangzhou',
      } as Span);
    }

    if (Math.random() > 0.5) {
      const cacheSpanId = generateId();
      const cacheService = services.find((s) => s.name === 'redis-cache')!;
      const cacheDuration = randomInt(1, 20);
      spans.push({
        traceId,
        spanId: cacheSpanId,
        parentSpanId: serviceSpanId,
        serviceName: cacheService.name,
        serviceType: cacheService.type,
        serviceIp: cacheService.ip,
        servicePort: cacheService.port,
        name: randomChoice(['GET user:123', 'SET user:123', 'DEL user:123']),
        kind: 'CLIENT',
        startTime: spanStartTime + randomInt(5, 30),
        endTime: spanStartTime + randomInt(5, 30) + cacheDuration,
        duration: cacheDuration,
        hasError: false,
        protocol: 'REDIS',
        component: 'jedis',
        dbType: 'redis',
        callType: 'sync',
        region: 'cn-hangzhou',
      } as Span);
    }

    if (api.appCode === 'order-service' && Math.random() > 0.5) {
      const mqSpanId = generateId();
      const mqService = services.find((s) => s.name === 'mq-service')!;
      const mqDuration = randomInt(5, 50);
      spans.push({
        traceId,
        spanId: mqSpanId,
        parentSpanId: serviceSpanId,
        serviceName: mqService.name,
        serviceType: mqService.type,
        serviceIp: mqService.ip,
        servicePort: mqService.port,
        name: 'send order_created event',
        kind: 'PRODUCER',
        startTime: spanStartTime + randomInt(20, 60),
        endTime: spanStartTime + randomInt(20, 60) + mqDuration,
        duration: mqDuration,
        hasError: false,
        protocol: 'KAFKA',
        component: 'kafka-client',
        mqTopic: 'order_events',
        callType: 'async',
        region: 'cn-hangzhou',
      } as Span);
    }

    const totalDuration = spans.reduce((sum, s) => sum + s.duration, 0);
    const errorSpanCount = spans.filter((s) => s.hasError).length;

    const trace = traceRepository.create({
      traceId,
      appCode: api.appCode,
      env,
      userId,
      serviceName: 'admin-web',
      serviceType: 'frontend',
      serviceIp: '10.0.1.10',
      servicePort: 80,
      method: api.method,
      path: api.path,
      statusCode,
      duration: totalDuration,
      hasError,
      errorMessage: hasError ? spans.find((s) => s.hasError)?.errorMessage : undefined,
      requestParams: { userId },
      responseData: { statusCode },
      spanCount: spans.length,
      errorSpanCount,
    });

    await traceRepository.save(trace);
    await spanRepository.save(spans as any);

    if (randomInt(1, 10) > 5) {
      const logLevels = ['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN'];
      if (hasError) logLevels.push('ERROR', 'ERROR');
      const logCount = randomInt(1, 5);
      const logs: Log[] = [];

      for (let j = 0; j < logCount; j++) {
        const level = randomChoice(logLevels);
        logs.push({
          appCode: api.appCode,
          env,
          level,
          logger: randomChoice(['com.example.service.UserService', 'com.example.controller.OrderController', 'com.example.dao.OrderDao']),
          thread: `http-nio-${api.appCode.includes('user') ? '8081' : '8082'}-exec-${randomInt(1, 10)}`,
          message: level === 'ERROR'
            ? `Failed to process request: ${randomChoice(['Database error', 'Timeout', 'Validation failed'])}`
            : level === 'WARN'
            ? `Warning: ${randomChoice(['High memory usage', 'Slow query detected', 'Connection pool nearly full'])}`
            : `${randomChoice(['Processing request', 'Data retrieved successfully', 'Cache hit', 'Cache miss'])}`,
          stackTrace: level === 'ERROR' ? 'java.lang.Exception: Test error stack trace' : undefined,
          traceId,
          className: randomChoice(['UserService', 'OrderController', 'PaymentService']),
          lineNumber: randomInt(50, 200),
        } as Log);
      }

      await logRepository.save(logs as any);
    }
  }

  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Generated trace data`);
}

async function generateDependencyData() {
  const dependencyRepository = AppDataSource.getRepository(ServiceDependency);
  const env = 'prod';

  const dependencies = serviceDependencies.map((dep) => {
    const callerService = services.find((s) => s.name === dep.caller)!;
    const calleeService = services.find((s) => s.name === dep.callee)!;
    const callCount = randomInt(100, 5000);
    const errorCount = Math.random() < 0.1 ? randomInt(1, Math.floor(callCount * 0.1)) : 0;

    return dependencyRepository.create({
      env,
      callerService: dep.caller,
      callerType: callerService.type,
      callerIp: callerService.ip,
      callerPort: callerService.port,
      calleeService: dep.callee,
      calleeType: calleeService.type,
      calleeIp: calleeService.ip,
      calleePort: calleeService.port,
      callType: dep.callType,
      callCount,
      errorCount,
      errorRate: callCount > 0 ? ((errorCount / callCount) * 100) : 0,
      avgDuration: randomInt(10, 500),
      p95Duration: randomInt(100, 1000),
      p99Duration: randomInt(500, 3000),
      minDuration: randomInt(1, 50),
      maxDuration: randomInt(500, 5000),
    });
  });

  await dependencyRepository.save(dependencies);
  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Generated dependency data`);
}

async function generateApiMetricData() {
  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);
  const env = 'prod';

  const metrics = apis.map((api) => {
    const requestCount = randomInt(100, 10000);
    const errorCount = Math.random() < 0.15 ? randomInt(1, Math.floor(requestCount * 0.05)) : 0;
    const successCount = requestCount - errorCount;

    return apiMetricRepository.create({
      appCode: api.appCode,
      env,
      method: api.method,
      path: api.path,
      requestCount,
      successCount,
      errorCount,
      errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100) : 0,
      qps: randomInt(10, 500),
      avgDuration: randomInt(20, 500),
      p50Duration: randomInt(10, 200),
      p75Duration: randomInt(50, 300),
      p95Duration: randomInt(100, 800),
      p99Duration: randomInt(200, 2000),
      minDuration: randomInt(1, 50),
      maxDuration: randomInt(500, 5000),
    });
  });

  await apiMetricRepository.save(metrics);
  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Generated API metric data`);
}

async function generateAlertChannelData() {
  const channelRepository = AppDataSource.getRepository(AlertChannel);
  const existingChannels = await channelRepository.find();

  if (existingChannels.length === 0) {
    const channels = [
      {
        name: '默认邮件通知',
        type: 'email',
        config: { emails: ['admin@example.com', 'devops@example.com'] },
        enabled: true,
        level: 'critical',
        description: '关键级别告警邮件通知',
      },
      {
        name: '钉钉告警群',
        type: 'dingtalk',
        config: { webhook: 'https://oapi.dingtalk.com/robot/send?access_token=xxx', secret: 'SECxxx' },
        enabled: true,
        level: 'warning',
        description: '开发团队钉钉告警群',
      },
      {
        name: '企业微信告警',
        type: 'wechat',
        config: { webhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx' },
        enabled: true,
        level: 'warning',
        description: '运维团队企业微信告警',
      },
      {
        name: 'WebHook回调',
        type: 'webhook',
        config: { url: 'https://api.example.com/alerts/webhook', method: 'POST', headers: {} },
        enabled: false,
        level: 'normal',
        description: '自定义WebHook回调',
      },
      {
        name: '短信通知',
        type: 'sms',
        config: { phones: ['13800138000', '13900139000'] },
        enabled: false,
        level: 'critical',
        description: '紧急情况短信通知',
      },
    ];

    await channelRepository.save(channels.map((c) => channelRepository.create(c)));
    console.log('Default alert channels created');
  }
}

async function generateConvergenceData() {
  const convergenceRepository = AppDataSource.getRepository(AlertConvergence);
  const existingConvergences = await convergenceRepository.find();

  if (existingConvergences.length === 0) {
    const convergences = [
      {
        ruleId: 1,
        ruleName: 'CPU使用率过高',
        groupKey: 'cpu_high_192.168.1.101',
        groupField: 'host',
        alertCount: randomInt(5, 20),
        triggerCount: randomInt(1, 5),
        isConverged: true,
        convergedAlertIds: '1,2,3,4,5',
        summary: '主机 192.168.1.101 CPU使用率持续过高，已收敛5条告警',
        firstAlertTime: dayjs().subtract(2, 'hour').toDate(),
        lastAlertTime: dayjs().subtract(30, 'minute').toDate(),
        nextNotifyTime: dayjs().add(15, 'minute').toDate(),
      },
      {
        ruleId: 2,
        ruleName: '内存使用率过高',
        groupKey: 'memory_high_order-service',
        groupField: 'service',
        alertCount: randomInt(3, 15),
        triggerCount: randomInt(1, 3),
        isConverged: true,
        convergedAlertIds: '6,7,8',
        summary: '订单服务内存使用率持续过高，已收敛3条告警',
        firstAlertTime: dayjs().subtract(1, 'hour').toDate(),
        lastAlertTime: dayjs().subtract(15, 'minute').toDate(),
        nextNotifyTime: dayjs().add(10, 'minute').toDate(),
      },
    ];

    await convergenceRepository.save(convergences.map((c) => convergenceRepository.create(c)));
    console.log('Default alert convergences created');
  }
}

let isGenerating = false;

async function runInitialGeneration() {
  if (isGenerating) return;
  isGenerating = true;
  try {
    await generateAlertChannelData();
    await generateConvergenceData();
    await generateTraceData();
    await generateDependencyData();
    await generateApiMetricData();
  } finally {
    isGenerating = false;
  }
}

export function initTraceDataGenerator() {
  setTimeout(() => {
    runInitialGeneration();
  }, 1500);

  cron.schedule('*/30 * * * * *', () => {
    generateTraceData().catch(console.error);
  });

  cron.schedule('0 * * * *', () => {
    generateDependencyData().catch(console.error);
    generateApiMetricData().catch(console.error);
  });

  console.log('Trace data generator initialized');
}
