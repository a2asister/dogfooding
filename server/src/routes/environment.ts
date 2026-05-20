import Router from 'koa-router';
import { AppDataSource } from '../config/database';
import { Environment } from '../entity/Environment';
import { success, error, paginate } from '../utils/response';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Like } from 'typeorm';

const router = new Router({ prefix: '/api/environments' });

router.use(authMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 100, keyword = '' } = ctx.query as any;
  const envRepository = AppDataSource.getRepository(Environment);
  const where = keyword ? { name: Like(`%${keyword}%`) } : {};
  const [list, total] = await envRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { sort: 'ASC', id: 'ASC' },
  });
  ctx.body = success(paginate(list, total, page, pageSize));
});

router.get('/all', async (ctx) => {
  const envRepository = AppDataSource.getRepository(Environment);
  const list = await envRepository.find({ where: { enabled: true }, order: { sort: 'ASC' } });
  ctx.body = success(list);
});

router.use(adminMiddleware);

router.post('/', async (ctx) => {
  const { name, code, description, sort, enabled } = ctx.request.body as any;
  if (!name || !code) {
    ctx.body = error(400, '环境名称和编码不能为空');
    return;
  }
  const envRepository = AppDataSource.getRepository(Environment);
  const existing = await envRepository.findOne({ where: { code } });
  if (existing) {
    ctx.body = error(400, '环境编码已存在');
    return;
  }
  const env = envRepository.create({ name, code, description, sort, enabled });
  await envRepository.save(env);
  ctx.body = success(env);
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const { name, code, description, sort, enabled } = ctx.request.body as any;
  const envRepository = AppDataSource.getRepository(Environment);
  const env = await envRepository.findOne({ where: { id } });
  if (!env) {
    ctx.body = error(404, '环境不存在');
    return;
  }
  if (code && code !== env.code) {
    const existing = await envRepository.findOne({ where: { code } });
    if (existing) {
      ctx.body = error(400, '环境编码已存在');
      return;
    }
  }
  Object.assign(env, { name, code, description, sort, enabled });
  await envRepository.save(env);
  ctx.body = success(env);
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const envRepository = AppDataSource.getRepository(Environment);
  await envRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const environmentRoutes = router;
