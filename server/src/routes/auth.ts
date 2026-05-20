import Router from 'koa-router';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { success, error } from '../utils/response';

const router = new Router({ prefix: '/api/auth' });
const JWT_SECRET = process.env.JWT_SECRET || 'monitor_platform_secret_key_2024';

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as any;
  if (!username || !password) {
    ctx.body = error(400, '用户名和密码不能为空');
    return;
  }
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { username } });
  if (!user) {
    ctx.body = error(401, '用户不存在');
    return;
  }
  if (!user.enabled) {
    ctx.body = error(401, '账户已被禁用');
    return;
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    ctx.body = error(401, '密码错误');
    return;
  }
  // @ts-ignore
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES_IN || '24h' }
  );
  ctx.body = success({
    token,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
    },
  });
});

router.get('/userinfo', async (ctx) => {
  const user = ctx.state.user as any;
  const userRepository = AppDataSource.getRepository(User);
  const dbUser = await userRepository.findOne({ where: { id: user.id } });
  if (!dbUser) {
    ctx.body = error(404, '用户不存在');
    return;
  }
  ctx.body = success({
    id: dbUser.id,
    username: dbUser.username,
    nickname: dbUser.nickname,
    email: dbUser.email,
    role: dbUser.role,
  });
});

router.post('/logout', async (ctx) => {
  ctx.body = success(null, '登出成功');
});

export const authRoutes = router;
