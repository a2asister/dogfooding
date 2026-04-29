import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import * as electiveService from '../services/electiveService';
import { z } from 'zod';

const router = new Router({ prefix: '/api/elective' });

router.get('/my-selections', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const { batchId } = ctx.query;

  if (!batchId) {
    ctx.status = 400;
    ctx.body = { success: false, message: '缺少批次ID' };
    return;
  }

  const result = await electiveService.getStudentSelections(
    studentId,
    batchId as string
  );

  ctx.body = { success: true, data: result };
});

router.get('/my-favorites', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const result = await electiveService.getStudentFavorites(studentId);

  ctx.body = { success: true, data: result };
});

const selectCourseSchema = z.object({
  courseId: z.string().min(1, '课程ID不能为空'),
  batchId: z.string().min(1, '批次ID不能为空'),
});

router.post('/select', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const result = selectCourseSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await electiveService.selectCourse(
    studentId,
    result.data.courseId,
    result.data.batchId
  );

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

const dropCourseSchema = z.object({
  courseId: z.string().min(1, '课程ID不能为空'),
  batchId: z.string().min(1, '批次ID不能为空'),
});

router.post('/drop', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const result = dropCourseSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await electiveService.dropCourse(
    studentId,
    result.data.courseId,
    result.data.batchId
  );

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

const toggleFavoriteSchema = z.object({
  courseId: z.string().min(1, '课程ID不能为空'),
});

router.post('/toggle-favorite', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const result = toggleFavoriteSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { message, isFavorite } = await electiveService.toggleFavorite(
    studentId,
    result.data.courseId
  );

  ctx.body = { success: true, message, data: { isFavorite } };
});

const checkConflictSchema = z.object({
  courseId: z.string().min(1, '课程ID不能为空'),
  batchId: z.string().min(1, '批次ID不能为空'),
});

router.post('/check-conflict', authMiddleware, async (ctx) => {
  const studentId = ctx.state.user.id;
  const result = checkConflictSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { conflict, conflictingCourse } = await electiveService.checkTimeConflict(
    studentId,
    result.data.courseId,
    result.data.batchId
  );

  ctx.body = { success: true, data: { conflict, conflictingCourse } };
});

export default router;
