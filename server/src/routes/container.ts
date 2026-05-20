import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { Container } from '../entity/Container';
import { ContainerMetric } from '../entity/ContainerMetric';
import { success, error, paginate } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/containers' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '', env = '', hostId = '' } = ctx.query as any;
  const containerRepository = AppDataSource.getRepository(Container);
  const where: any = {};
  if (env) where.env = env;
  if (hostId) where.hostId = parseInt(hostId);
  const [list, total] = await containerRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'ASC' },
  });
  const filteredList = keyword
    ? list.filter((c) => c.name.includes(keyword) || c.containerId.includes(keyword) || c.image.includes(keyword))
    : list;
  ctx.body = success(paginate(filteredList, total, page, pageSize));
});

router.get('/all', async (ctx) => {
  const { env = '' } = ctx.query as any;
  const containerRepository = AppDataSource.getRepository(Container);
  const where: any = {};
  if (env) where.env = env;
  const list = await containerRepository.find({ where, order: { id: 'ASC' } });
  ctx.body = success(list);
});

router.get('/:containerId/metrics', async (ctx) => {
  const { containerId } = ctx.params;
  const { startTime, endTime } = ctx.query as any;
  const metricRepository = AppDataSource.getRepository(ContainerMetric);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();
  const list = await metricRepository
    .createQueryBuilder('metric')
    .where('metric.containerId = :containerId', { containerId })
    .andWhere('metric.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('metric.timestamp', 'ASC')
    .limit(1000)
    .getMany();
  ctx.body = success(list);
});

router.get('/:containerId/metrics/latest', async (ctx) => {
  const { containerId } = ctx.params;
  const metricRepository = AppDataSource.getRepository(ContainerMetric);
  const latest = await metricRepository.findOne({
    where: { containerId },
    order: { timestamp: 'DESC' },
  });
  ctx.body = success(latest);
});

router.get('/overview', async (ctx) => {
  const containerRepository = AppDataSource.getRepository(Container);
  const containers = await containerRepository.find();
  const runningCount = containers.filter((c) => c.status === 'running').length;
  ctx.body = success({
    total: containers.length,
    running: runningCount,
    stopped: containers.length - runningCount,
  });
});

router.post('/', async (ctx) => {
  const data = ctx.request.body as any;
  if (!data.containerId || !data.name) {
    ctx.body = error(400, '容器ID和名称不能为空');
    return;
  }
  const containerRepository = AppDataSource.getRepository(Container);
  const existing = await containerRepository.findOne({ where: { containerId: data.containerId } });
  if (existing) {
    ctx.body = error(400, '容器ID已存在');
    return;
  }
  const container = containerRepository.create(data);
  await containerRepository.save(container);
  ctx.body = success(container);
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const data = ctx.request.body as any;
  const containerRepository = AppDataSource.getRepository(Container);
  const container = await containerRepository.findOne({ where: { id } });
  if (!container) {
    ctx.body = error(404, '容器不存在');
    return;
  }
  Object.assign(container, data);
  await containerRepository.save(container);
  ctx.body = success(container);
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const containerRepository = AppDataSource.getRepository(Container);
  await containerRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const containerRoutes = router;
