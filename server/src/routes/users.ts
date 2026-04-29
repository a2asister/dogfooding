import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
import { z } from 'zod';
import type { UserRole } from '../types';

const router = new Router({ prefix: '/api/users' });

router.get('/', authMiddleware, async (ctx) => {
  const { role, gradeId, classId, keyword, page, pageSize } = ctx.query;

  const validRoles: UserRole[] = ['admin', 'teacher', 'student'];
  const validRole = role && validRoles.includes(role as UserRole) ? (role as UserRole) : undefined;

  const result = await userService.getUsers({
    role: validRole,
    gradeId: gradeId as string,
    classId: classId as string,
    keyword: keyword as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  });

  ctx.body = { success: true, data: result };
});

router.get('/teachers', authMiddleware, async (ctx) => {
  const result = await userService.getTeachers();
  ctx.body = { success: true, data: result };
});

router.get('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const user = await userService.getUserById(id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { success: false, message: '用户不存在' };
    return;
  }

  ctx.body = { success: true, data: user };
});

const createUserSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '姓名不能为空'),
  role: z.enum(['admin', 'teacher', 'student']),
  email: z.string().email('邮箱格式错误').optional(),
  phone: z.string().optional(),
  studentNo: z.string().optional(),
  teacherNo: z.string().optional(),
  gradeId: z.string().optional(),
  classId: z.string().optional(),
});

router.post('/', authMiddleware, async (ctx) => {
  const result = createUserSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message, user } = await userService.createUser(result.data);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.status = 201;
  ctx.body = { success: true, message, data: user };
});

const updateUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空').optional(),
  email: z.string().email('邮箱格式错误').optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  gradeId: z.string().optional(),
  classId: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.put('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const result = updateUserSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await userService.updateUser(id, result.data);

  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.delete('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await userService.deleteUser(id);

  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.post('/:id/toggle-status', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message, isActive } = await userService.toggleUserStatus(id);

  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message, data: { isActive } };
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, '密码至少6位'),
});

router.post('/:id/reset-password', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const result = resetPasswordSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await authService.resetPassword(id, result.data.newPassword);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

export default router;
