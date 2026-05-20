import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { Log } from '../entity/Log';
import { success, error, paginate } from '../utils/response';
import { authMiddleware } from '../middleware/auth';
import { Like, MoreThan } from 'typeorm';
import dayjs from 'dayjs';

const router = new Router({ prefix: '/api/logs' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const {
    page = 1,
    pageSize = 20,
    appCode = '',
    env = '',
    level = '',
    keyword = '',
    startTime,
    endTime,
  } = ctx.query as any;
  const logRepository = AppDataSource.getRepository(Log);
  const where: any = {};
  if (appCode) where.appCode = appCode;
  if (env) where.env = env;
  if (level) where.level = level;
  if (keyword) where.message = Like(`%${keyword}%`);
  if (startTime) where.timestamp = MoreThan(new Date(startTime));
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(24, 'hour').toDate();
  const [list, total] = await logRepository
    .createQueryBuilder('log')
    .where(appCode ? 'log.appCode = :appCode' : '1=1', { appCode })
    .andWhere(env ? 'log.env = :env' : '1=1', { env })
    .andWhere(level ? 'log.level = :level' : '1=1', { level })
    .andWhere(keyword ? 'log.message LIKE :keyword' : '1=1', { keyword: `%${keyword}%` })
    .andWhere('log.timestamp BETWEEN :start AND :end', { start, end })
    .orderBy('log.timestamp', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();
  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const logRepository = AppDataSource.getRepository(Log);
  const log = await logRepository.findOne({ where: { id } });
  if (!log) {
    ctx.body = error(404, '日志不存在');
    return;
  }
  ctx.body = success(log);
});

router.get('/stats/count', async (ctx) => {
  const { appCode = '', env = '', startTime, endTime } = ctx.query as any;
  const logRepository = AppDataSource.getRepository(Log);
  const end = endTime ? new Date(endTime) : new Date();
  const start = startTime ? new Date(startTime) : dayjs().subtract(24, 'hour').toDate();
  const result = await logRepository
    .createQueryBuilder('log')
    .select('log.level', 'level')
    .addSelect('COUNT(*)', 'count')
    .where(appCode ? 'log.appCode = :appCode' : '1=1', { appCode })
    .andWhere(env ? 'log.env = :env' : '1=1', { env })
    .andWhere('log.timestamp BETWEEN :start AND :end', { start, end })
    .groupBy('log.level')
    .getRawMany();
  ctx.body = success(result);
});

router.post('/ingest', async (ctx) => {
  const logs = Array.isArray(ctx.request.body) ? ctx.request.body : [ctx.request.body];
  const logRepository = AppDataSource.getRepository(Log);
  const entities = logs.map((log: any) => logRepository.create(log));
  await logRepository.save(entities as any);
  ctx.body = success({ inserted: entities.length });
});

router.delete('/clean', async (ctx) => {
  const { days = 30 } = ctx.query as any;
  const logRepository = AppDataSource.getRepository(Log);
  const cutoffDate = dayjs().subtract(days, 'day').toDate();
  const result = await logRepository
    .createQueryBuilder()
    .delete()
    .where('timestamp < :cutoffDate', { cutoffDate })
    .execute();
  ctx.body = success({ deleted: result.affected });
});

router.get('/trace/:traceId', async (ctx) => {
  const { traceId } = ctx.params;
  const { page = 1, pageSize = 100 } = ctx.query as any;
  const logRepository = AppDataSource.getRepository(Log);

  const [list, total] = await logRepository.findAndCount({
    where: { traceId },
    order: { timestamp: 'ASC' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/trace/:traceId/count', async (ctx) => {
  const { traceId } = ctx.params;
  const logRepository = AppDataSource.getRepository(Log);

  const result = await logRepository
    .createQueryBuilder('log')
    .select('log.level', 'level')
    .addSelect('COUNT(*)', 'count')
    .where('log.traceId = :traceId', { traceId })
    .groupBy('log.level')
    .getRawMany();

  const stats: any = { total: 0 };
  result.forEach((item: any) => {
    stats[item.level] = parseInt(item.count);
    stats.total += parseInt(item.count);
  });

  ctx.body = success(stats);
});

export const logRoutes = router;
