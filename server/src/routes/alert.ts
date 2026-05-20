import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { AlertRule } from '../entity/AlertRule';
import { AlertRecord } from '../entity/AlertRecord';
import { success, error, paginate } from '../utils/response';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Like } from 'typeorm';

const router = new Router({ prefix: '/api/alerts' });

router.use(authMiddleware);

router.get('/rules', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '', enabled = '' } = ctx.query as any;
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  const where: any = {};
  if (enabled !== '') where.enabled = enabled === 'true';
  const [list, total] = await ruleRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'DESC' },
  });
  const filteredList = keyword
    ? list.filter((r) => r.name.includes(keyword) || r.metric.includes(keyword))
    : list;
  ctx.body = success(paginate(filteredList, total, page, pageSize));
});

router.get('/rules/all', async (ctx) => {
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  const list = await ruleRepository.find({ where: { enabled: true }, order: { id: 'ASC' } });
  ctx.body = success(list);
});

router.get('/rules/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  const rule = await ruleRepository.findOne({ where: { id } });
  if (!rule) {
    ctx.body = error(404, '告警规则不存在');
    return;
  }
  ctx.body = success(rule);
});

router.get('/records', async (ctx) => {
  const {
    page = 1,
    pageSize = 20,
    status = '',
    level = '',
    keyword = '',
    startTime,
    endTime,
  } = ctx.query as any;
  const recordRepository = AppDataSource.getRepository(AlertRecord);
  const where: any = {};
  if (status) where.status = status;
  if (level) where.level = level;
  let query = recordRepository.createQueryBuilder('record');
  if (status) query = query.andWhere('record.status = :status', { status });
  if (level) query = query.andWhere('record.level = :level', { level });
  if (keyword) {
    query = query.andWhere('record.ruleName LIKE :keyword OR record.metric LIKE :keyword', {
      keyword: `%${keyword}%`,
    });
  }
  if (startTime) query = query.andWhere('record.createdAt >= :startTime', { startTime: new Date(startTime) });
  if (endTime) query = query.andWhere('record.createdAt <= :endTime', { endTime: new Date(endTime) });
  const [list, total] = await query
    .orderBy('record.createdAt', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();
  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/records/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const recordRepository = AppDataSource.getRepository(AlertRecord);
  const record = await recordRepository.findOne({ where: { id } });
  if (!record) {
    ctx.body = error(404, '告警记录不存在');
    return;
  }
  ctx.body = success(record);
});

router.put('/records/:id/handle', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const { status, handleNote } = ctx.request.body as any;
  const user = ctx.state.user as any;
  const recordRepository = AppDataSource.getRepository(AlertRecord);
  const record = await recordRepository.findOne({ where: { id } });
  if (!record) {
    ctx.body = error(404, '告警记录不存在');
    return;
  }
  record.status = status || 'processing';
  record.handledBy = user.username;
  if (handleNote) record.handleNote = handleNote;
  if (status === 'resolved') record.resolvedAt = new Date();
  await recordRepository.save(record);
  ctx.body = success(record);
});

router.get('/overview', async (ctx) => {
  const recordRepository = AppDataSource.getRepository(AlertRecord);
  const pendingCount = await recordRepository.count({ where: { status: 'pending' } });
  const processingCount = await recordRepository.count({ where: { status: 'processing' } });
  const criticalCount = await recordRepository.count({ where: { level: 'critical', status: 'pending' } });
  const warningCount = await recordRepository.count({ where: { level: 'warning', status: 'pending' } });
  ctx.body = success({
    pending: pendingCount,
    processing: processingCount,
    critical: criticalCount,
    warning: warningCount,
  });
});

router.use(adminMiddleware);

router.post('/rules', async (ctx) => {
  const data = ctx.request.body as any;
  if (!data.name || !data.metric || !data.operator || data.threshold === undefined) {
    ctx.body = error(400, '规则名称、指标、操作符和阈值不能为空');
    return;
  }
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  const rule = ruleRepository.create(data);
  await ruleRepository.save(rule);
  ctx.body = success(rule);
});

router.put('/rules/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const data = ctx.request.body as any;
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  const rule = await ruleRepository.findOne({ where: { id } });
  if (!rule) {
    ctx.body = error(404, '告警规则不存在');
    return;
  }
  Object.assign(rule, data);
  await ruleRepository.save(rule);
  ctx.body = success(rule);
});

router.delete('/rules/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const ruleRepository = AppDataSource.getRepository(AlertRule);
  await ruleRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const alertRoutes = router;
