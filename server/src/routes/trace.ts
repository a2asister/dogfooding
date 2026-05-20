import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { Trace } from '../entity/Trace';
import { Span } from '../entity/Span';
import { ServiceDependency } from '../entity/ServiceDependency';
import { ApiMetric } from '../entity/ApiMetric';
import { success, error, paginate } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import { Like, MoreThan, Between, In } from 'typeorm';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/traces' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const {
    page = 1,
    pageSize = 20,
    traceId = '',
    userId = '',
    appCode = '',
    serviceName = '',
    path = '',
    env = '',
    hasError = '',
    startTime,
    endTime,
    minDuration = 0,
    maxDuration = 0,
  } = ctx.query as any;

  const traceRepository = AppDataSource.getRepository(Trace);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = traceRepository.createQueryBuilder('trace')
    .where('trace.timestamp BETWEEN :start AND :end', { start, end });

  if (traceId) query = query.andWhere('trace.traceId LIKE :traceId', { traceId: `%${traceId}%` });
  if (userId) query = query.andWhere('trace.userId LIKE :userId', { userId: `%${userId}%` });
  if (appCode) query = query.andWhere('trace.appCode = :appCode', { appCode });
  if (serviceName) query = query.andWhere('trace.serviceName LIKE :serviceName', { serviceName: `%${serviceName}%` });
  if (path) query = query.andWhere('trace.path LIKE :path', { path: `%${path}%` });
  if (env) query = query.andWhere('trace.env = :env', { env });
  if (hasError === 'true') query = query.andWhere('trace.hasError = :hasError', { hasError: true });
  if (hasError === 'false') query = query.andWhere('trace.hasError = :hasError', { hasError: false });
  if (minDuration > 0) query = query.andWhere('trace.duration >= :minDuration', { minDuration });
  if (maxDuration > 0) query = query.andWhere('trace.duration <= :maxDuration', { maxDuration });

  const [list, total] = await query
    .orderBy('trace.timestamp', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/stats/overview', async (ctx) => {
  const { env = '', startTime, endTime } = ctx.query as any;
  const traceRepository = AppDataSource.getRepository(Trace);
  const spanRepository = AppDataSource.getRepository(Span);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let traceQuery = traceRepository.createQueryBuilder('trace')
    .where('trace.timestamp BETWEEN :start AND :end', { start, end });
  let spanQuery = spanRepository.createQueryBuilder('span')
    .where('span.timestamp BETWEEN :start AND :end', { start, end });

  if (env) {
    traceQuery = traceQuery.andWhere('trace.env = :env', { env });
    spanQuery = spanQuery.andWhere('span.serviceName IN (SELECT serviceName FROM trace WHERE env = :env)', { env });
  }

  const totalTraces = await traceQuery.getCount();
  const errorTraces = await traceQuery.andWhere('trace.hasError = :hasError', { hasError: true }).getCount();
  const totalSpans = await spanQuery.getCount();
  const errorSpans = await spanQuery.andWhere('span.hasError = :hasError', { hasError: true }).getCount();

  const avgDurationResult = await traceQuery
    .select('AVG(trace.duration)', 'avgDuration')
    .getRawOne();

  ctx.body = success({
    totalTraces,
    errorTraces,
    errorRate: totalTraces > 0 ? ((errorTraces / totalTraces) * 100).toFixed(2) : 0,
    totalSpans,
    errorSpans,
    avgDuration: avgDurationResult?.avgDuration || 0,
  });
});

router.get('/stats/top-slow', async (ctx) => {
  const { env = '', limit = 10, startTime, endTime } = ctx.query as any;
  const traceRepository = AppDataSource.getRepository(Trace);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = traceRepository.createQueryBuilder('trace')
    .where('trace.timestamp BETWEEN :start AND :end', { start, end });

  if (env) query = query.andWhere('trace.env = :env', { env });

  const list = await query
    .orderBy('trace.duration', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.get('/stats/top-errors', async (ctx) => {
  const { env = '', limit = 10, startTime, endTime } = ctx.query as any;
  const traceRepository = AppDataSource.getRepository(Trace);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = traceRepository.createQueryBuilder('trace')
    .where('trace.timestamp BETWEEN :start AND :end', { start, end })
    .andWhere('trace.hasError = :hasError', { hasError: true });

  if (env) query = query.andWhere('trace.env = :env', { env });

  const list = await query
    .orderBy('trace.timestamp', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.get('/stats/top-timeout', async (ctx) => {
  const { env = '', limit = 10, threshold = 3000, startTime, endTime } = ctx.query as any;
  const traceRepository = AppDataSource.getRepository(Trace);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = traceRepository.createQueryBuilder('trace')
    .where('trace.timestamp BETWEEN :start AND :end', { start, end })
    .andWhere('trace.duration >= :threshold', { threshold });

  if (env) query = query.andWhere('trace.env = :env', { env });

  const list = await query
    .orderBy('trace.duration', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.get('/dependency/topology', async (ctx) => {
  const { env = 'prod', startTime, endTime } = ctx.query as any;
  const dependencyRepository = AppDataSource.getRepository(ServiceDependency);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  const dependencies = await dependencyRepository.createQueryBuilder('dep')
    .where('dep.env = :env', { env })
    .andWhere('dep.timestamp BETWEEN :start AND :end', { start, end })
    .getMany();

  const services = new Map<string, any>();
  const edges: any[] = [];

  dependencies.forEach((dep) => {
    if (!services.has(dep.callerService)) {
      services.set(dep.callerService, {
        id: dep.callerService,
        name: dep.callerService,
        type: dep.callerType,
        ip: dep.callerIp,
        port: dep.callerPort,
        callCount: 0,
        errorCount: 0,
        avgDuration: 0,
        isEntry: false,
        isExit: false,
      });
    }
    if (!services.has(dep.calleeService)) {
      services.set(dep.calleeService, {
        id: dep.calleeService,
        name: dep.calleeService,
        type: dep.calleeType,
        ip: dep.calleeIp,
        port: dep.calleePort,
        callCount: 0,
        errorCount: 0,
        avgDuration: 0,
        isEntry: false,
        isExit: false,
      });
    }

    const caller = services.get(dep.callerService)!;
    const callee = services.get(dep.calleeService)!;

    caller.callCount += dep.callCount;
    caller.errorCount += dep.errorCount;
    caller.avgDuration = (caller.avgDuration + dep.avgDuration) / 2;
    caller.isExit = true;

    callee.callCount += dep.callCount;
    callee.errorCount += dep.errorCount;
    callee.avgDuration = (callee.avgDuration + dep.avgDuration) / 2;
    callee.isEntry = true;

    edges.push({
      source: dep.callerService,
      target: dep.calleeService,
      callType: dep.callType,
      callCount: dep.callCount,
      errorCount: dep.errorCount,
      errorRate: dep.errorRate,
      avgDuration: dep.avgDuration,
      p95Duration: dep.p95Duration,
      p99Duration: dep.p99Duration,
    });
  });

  const nodes = Array.from(services.values()).map((node) => ({
    ...node,
    errorRate: node.callCount > 0 ? ((node.errorCount / node.callCount) * 100).toFixed(2) : 0,
    hasError: node.errorCount > 0,
  }));

  ctx.body = success({ nodes, edges });
});

router.get('/dependency/list', async (ctx) => {
  const {
    page = 1,
    pageSize = 20,
    env = 'prod',
    callerService = '',
    calleeService = '',
    startTime,
    endTime,
  } = ctx.query as any;

  const dependencyRepository = AppDataSource.getRepository(ServiceDependency);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = dependencyRepository.createQueryBuilder('dep')
    .where('dep.env = :env', { env })
    .andWhere('dep.timestamp BETWEEN :start AND :end', { start, end });

  if (callerService) query = query.andWhere('dep.callerService LIKE :callerService', { callerService: `%${callerService}%` });
  if (calleeService) query = query.andWhere('dep.calleeService LIKE :calleeService', { calleeService: `%${calleeService}%` });

  const [list, total] = await query
    .orderBy('dep.callCount', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/spans/:spanId', async (ctx) => {
  const { spanId } = ctx.params;
  const spanRepository = AppDataSource.getRepository(Span);

  const span = await spanRepository.findOne({ where: { spanId } });
  if (!span) {
    ctx.body = error(404, 'Span 不存在');
    return;
  }

  ctx.body = success(span);
});

router.get('/api-metrics', async (ctx) => {
  const {
    page = 1,
    pageSize = 20,
    appCode = '',
    env = 'prod',
    path = '',
    startTime,
    endTime,
  } = ctx.query as any;

  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = apiMetricRepository.createQueryBuilder('api')
    .where('api.env = :env', { env })
    .andWhere('api.timestamp BETWEEN :start AND :end', { start, end });

  if (appCode) query = query.andWhere('api.appCode = :appCode', { appCode });
  if (path) query = query.andWhere('api.path LIKE :path', { path: `%${path}%` });

  const [list, total] = await query
    .orderBy('api.requestCount', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/api-metrics/chart', async (ctx) => {
  const { appCode = '', env = 'prod', path = '', startTime, endTime } = ctx.query as any;
  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  let query = apiMetricRepository.createQueryBuilder('api')
    .where('api.env = :env', { env })
    .andWhere('api.timestamp BETWEEN :start AND :end', { start, end });

  if (appCode) query = query.andWhere('api.appCode = :appCode', { appCode });
  if (path) query = query.andWhere('api.path = :path', { path });

  const list = await query
    .orderBy('api.timestamp', 'ASC')
    .getMany();

  ctx.body = success(list);
});

router.get('/api-metrics/top-slow', async (ctx) => {
  const { env = 'prod', limit = 10, startTime, endTime } = ctx.query as any;
  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  const list = await apiMetricRepository.createQueryBuilder('api')
    .where('api.env = :env', { env })
    .andWhere('api.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('api.avgDuration', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.get('/api-metrics/top-error', async (ctx) => {
  const { env = 'prod', limit = 10, startTime, endTime } = ctx.query as any;
  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  const list = await apiMetricRepository.createQueryBuilder('api')
    .where('api.env = :env', { env })
    .andWhere('api.timestamp BETWEEN :start AND :end', { start, end })
    .andWhere('api.errorCount > 0')
    .orderBy('api.errorRate', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.get('/api-metrics/top-qps', async (ctx) => {
  const { env = 'prod', limit = 10, startTime, endTime } = ctx.query as any;
  const apiMetricRepository = AppDataSource.getRepository(ApiMetric);

  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();

  const list = await apiMetricRepository.createQueryBuilder('api')
    .where('api.env = :env', { env })
    .andWhere('api.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('api.qps', 'DESC')
    .take(parseInt(limit as string))
    .getMany();

  ctx.body = success(list);
});

router.post('/ingest', async (ctx) => {
  const data = ctx.request.body as any;
  const traceRepository = AppDataSource.getRepository(Trace);
  const spanRepository = AppDataSource.getRepository(Span);

  if (data.trace) {
    const trace = traceRepository.create(data.trace);
    await traceRepository.save(trace);
  }

  if (data.spans && data.spans.length > 0) {
    const spans = data.spans.map((span: any) => spanRepository.create(span));
    await spanRepository.save(spans);
  }

  ctx.body = success({ received: true });
});

router.get('/:traceId/spans', async (ctx) => {
  const { traceId } = ctx.params;
  const spanRepository = AppDataSource.getRepository(Span);

  const spans = await spanRepository.find({
    where: { traceId },
    order: { startTime: 'ASC' },
  });

  ctx.body = success(spans);
});

router.get('/:traceId', async (ctx) => {
  const { traceId } = ctx.params;
  const traceRepository = AppDataSource.getRepository(Trace);
  const spanRepository = AppDataSource.getRepository(Span);

  const trace = await traceRepository.findOne({ where: { traceId } });
  if (!trace) {
    ctx.body = error(404, 'Trace 不存在');
    return;
  }

  const spans = await spanRepository.find({
    where: { traceId },
    order: { startTime: 'ASC' },
  });

  ctx.body = success({ trace, spans });
});

export const traceRoutes = router;
