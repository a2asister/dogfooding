import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { Host } from '../entity/Host';
import { HostMetric } from '../entity/HostMetric';
import { success, error, paginate } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import { MoreThan } from 'typeorm';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/hosts' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '', env = '' } = ctx.query as any;
  const hostRepository = AppDataSource.getRepository(Host);
  const where: any = {};
  if (env) where.env = env;
  const [list, total] = await hostRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'ASC' },
  });
  const filteredList = keyword
    ? list.filter((h) => h.hostname.includes(keyword) || h.ip.includes(keyword))
    : list;
  ctx.body = success(paginate(filteredList, total, page, pageSize));
});

router.get('/all', async (ctx) => {
  const { env = '' } = ctx.query as any;
  const hostRepository = AppDataSource.getRepository(Host);
  const where: any = {};
  if (env) where.env = env;
  const list = await hostRepository.find({ where, order: { id: 'ASC' } });
  ctx.body = success(list);
});

router.get('/:id/metrics', async (ctx) => {
  const hostId = parseInt(ctx.params.id);
  const { startTime, endTime } = ctx.query as any;
  const metricRepository = AppDataSource.getRepository(HostMetric);
  const where: any = { hostId };
  if (startTime) where.timestamp = MoreThan(new Date(startTime));
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();
  const list = await metricRepository
    .createQueryBuilder('metric')
    .where('metric.hostId = :hostId', { hostId })
    .andWhere('metric.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('metric.timestamp', 'ASC')
    .limit(1000)
    .getMany();
  ctx.body = success(list);
});

router.get('/:id/metrics/latest', async (ctx) => {
  const hostId = parseInt(ctx.params.id);
  const metricRepository = AppDataSource.getRepository(HostMetric);
  const latest = await metricRepository.findOne({
    where: { hostId },
    order: { timestamp: 'DESC' },
  });
  ctx.body = success(latest);
});

router.get('/overview', async (ctx) => {
  const hostRepository = AppDataSource.getRepository(Host);
  const metricRepository = AppDataSource.getRepository(HostMetric);
  const hosts = await hostRepository.find();
  const onlineCount = hosts.filter((h) => h.status === 'online').length;
  const latestMetrics = await metricRepository
    .createQueryBuilder('m')
    .innerJoin((subQuery) => {
      return subQuery
        .select('MAX(timestamp)', 'max_time')
        .addSelect('hostId')
        .from(HostMetric, 'm2')
        .groupBy('m2.hostId');
    }, 'latest', 'm.hostId = latest.hostId AND m.timestamp = latest.max_time')
    .getMany();
  const avgCpu = latestMetrics.length
    ? latestMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / latestMetrics.length
    : 0;
  const avgMemory = latestMetrics.length
    ? latestMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / latestMetrics.length
    : 0;
  ctx.body = success({
    total: hosts.length,
    online: onlineCount,
    offline: hosts.length - onlineCount,
    avgCpu: avgCpu.toFixed(1),
    avgMemory: avgMemory.toFixed(1),
    latestMetrics,
  });
});

router.post('/', async (ctx) => {
  const { hostname, ip, env, cpuCores, memoryTotal, status, description } = ctx.request.body as any;
  if (!hostname || !ip) {
    ctx.body = error(400, '主机名和IP不能为空');
    return;
  }
  const hostRepository = AppDataSource.getRepository(Host);
  const existing = await hostRepository.findOne({ where: { ip } });
  if (existing) {
    ctx.body = error(400, 'IP地址已存在');
    return;
  }
  const host = hostRepository.create({ hostname, ip, env, cpuCores, memoryTotal, status, description });
  await hostRepository.save(host);
  ctx.body = success(host);
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const data = ctx.request.body as any;
  const hostRepository = AppDataSource.getRepository(Host);
  const host = await hostRepository.findOne({ where: { id } });
  if (!host) {
    ctx.body = error(404, '主机不存在');
    return;
  }
  Object.assign(host, data);
  await hostRepository.save(host);
  ctx.body = success(host);
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const hostRepository = AppDataSource.getRepository(Host);
  await hostRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const hostRoutes = router;
