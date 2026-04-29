import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import * as authService from '../services/authService';
import { z } from 'zod';

const router = new Router({ prefix: '/api/auth' });

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

router.post('/login', async (ctx) => {
  const result = loginSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, token, user, message } = await authService.login(
    result.data.username,
    result.data.password
  );

  if (!success) {
    ctx.status = 401;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, data: { token, user }, message: '登录成功' };
});

const registerSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '姓名不能为空'),
  role: z.enum(['admin', 'teacher', 'student']),
  email: z.string().email('邮箱格式错误').optional(),
  phone: z.string().optional(),
  studentNo: z.string().optional(),
  teacherNo: z.string().optional(),
  gradeId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
});

router.post('/register', async (ctx) => {
  const result = registerSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await authService.register(result.data);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.get('/profile', authMiddleware, async (ctx) => {
  const userId = ctx.state.user.id;
  const user = await authService.getCurrentUser(userId);

  if (!user) {
    ctx.status = 404;
    ctx.body = { success: false, message: '用户不存在' };
    return;
  }

  ctx.body = { success: true, data: user };
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '原密码不能为空'),
  newPassword: z.string().min(6, '新密码至少6位'),
});

router.post('/change-password', authMiddleware, async (ctx) => {
  const result = changePasswordSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const userId = ctx.state.user.id;
  const { success, message } = await authService.changePassword(
    userId,
    result.data.oldPassword,
    result.data.newPassword
  );

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

export default router;
