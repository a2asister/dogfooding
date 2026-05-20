import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { App } from '../entity/App';
import { AppMetric } from '../entity/AppMetric';
import { success, error, paginate } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/apps' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '', env = '', type = '' } = ctx.query as any;
  const appRepository = AppDataSource.getRepository(App);
  const where: any = {};
  if (env) where.env = env;
  if (type) where.type = type;
  const [list, total] = await appRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'ASC' },
  });
  const filteredList = keyword
    ? list.filter((a) => a.name.includes(keyword) || a.code.includes(keyword))
    : list;
  ctx.body = success(paginate(filteredList, total, page, pageSize));
});

router.get('/all', async (ctx) => {
  const { env = '' } = ctx.query as any;
  const appRepository = AppDataSource.getRepository(App);
  const where: any = {};
  if (env) where.env = env;
  const list = await appRepository.find({ where, order: { id: 'ASC' } });
  ctx.body = success(list);
});

router.get('/:appCode/metrics', async (ctx) => {
  const { appCode } = ctx.params;
  const { startTime, endTime } = ctx.query as any;
  const metricRepository = AppDataSource.getRepository(AppMetric);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(1, 'hour').toDate();
  const list = await metricRepository
    .createQueryBuilder('metric')
    .where('metric.appCode = :appCode', { appCode })
    .andWhere('metric.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('metric.timestamp', 'ASC')
    .limit(1000)
    .getMany();
  ctx.body = success(list);
});

router.get('/:appCode/metrics/latest', async (ctx) => {
  const { appCode } = ctx.params;
  const metricRepository = AppDataSource.getRepository(AppMetric);
  const latest = await metricRepository.findOne({
    where: { appCode },
    order: { timestamp: 'DESC' },
  });
  ctx.body = success(latest);
});

router.get('/overview', async (ctx) => {
  const appRepository = AppDataSource.getRepository(App);
  const apps = await appRepository.find();
  const runningCount = apps.filter((a) => a.status === 'running').length;
  ctx.body = success({
    total: apps.length,
    running: runningCount,
    stopped: apps.length - runningCount,
  });
});

router.post('/', async (ctx) => {
  const data = ctx.request.body as any;
  if (!data.name || !data.code) {
    ctx.body = error(400, '应用名称和编码不能为空');
    return;
  }
  const appRepository = AppDataSource.getRepository(App);
  const existing = await appRepository.findOne({ where: { code: data.code } });
  if (existing) {
    ctx.body = error(400, '应用编码已存在');
    return;
  }
  const app = appRepository.create(data);
  await appRepository.save(app);
  ctx.body = success(app);
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const data = ctx.request.body as any;
  const appRepository = AppDataSource.getRepository(App);
  const app = await appRepository.findOne({ where: { id } });
  if (!app) {
    ctx.body = error(404, '应用不存在');
    return;
  }
  Object.assign(app, data);
  await appRepository.save(app);
  ctx.body = success(app);
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const appRepository = AppDataSource.getRepository(App);
  await appRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const appRoutes = router;
