import Router from 'koa-router';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { success, error, paginate } from '../utils/response';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { Like } from 'typeorm';

const router = new Router({ prefix: '/api/users' });

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', async (ctx) => {
  const { page = 1, pageSize = 20, keyword = '' } = ctx.query as any;
  const userRepository = AppDataSource.getRepository(User);
  const where = keyword ? { username: Like(`%${keyword}%`) } : {};
  const [list, total] = await userRepository.findAndCount({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: { id: 'DESC' },
    select: ['id', 'username', 'nickname', 'email', 'role', 'enabled', 'createdAt'],
  });
  ctx.body = success(paginate(list, total, page, pageSize));
});

router.post('/', async (ctx) => {
  const { username, password, nickname, email, role } = ctx.request.body as any;
  if (!username || !password) {
    ctx.body = error(400, '用户名和密码不能为空');
    return;
  }
  const userRepository = AppDataSource.getRepository(User);
  const existing = await userRepository.findOne({ where: { username } });
  if (existing) {
    ctx.body = error(400, '用户名已存在');
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepository.create({
    username,
    password: hashedPassword,
    nickname,
    email,
    role: role || 'user',
  });
  await userRepository.save(user);
  ctx.body = success(user);
});

router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const { password, nickname, email, role, enabled } = ctx.request.body as any;
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    ctx.body = error(404, '用户不存在');
    return;
  }
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  if (nickname !== undefined) user.nickname = nickname;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (enabled !== undefined) user.enabled = enabled;
  await userRepository.save(user);
  ctx.body = success(user);
});

router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    ctx.body = error(404, '用户不存在');
    return;
  }
  if (user.username === 'admin') {
    ctx.body = error(400, '不能删除超级管理员');
    return;
  }
  await userRepository.delete(id);
  ctx.body = success(null, '删除成功');
});

export const userRoutes = router;
