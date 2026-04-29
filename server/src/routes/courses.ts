import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import * as courseService from '../services/courseService';
import { z } from 'zod';

const router = new Router({ prefix: '/api/courses' });

router.get('/categories', authMiddleware, async (ctx) => {
  const result = await courseService.getCourseCategories();
  ctx.body = { success: true, data: result };
});

const createCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  code: z.string().min(1, '分类编码不能为空'),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

router.post('/categories', authMiddleware, async (ctx) => {
  const result = createCategorySchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message, category } = await courseService.createCourseCategory(result.data);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.status = 201;
  ctx.body = { success: true, message, data: category };
});

const updateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').optional(),
  code: z.string().min(1, '分类编码不能为空').optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

router.put('/categories/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const result = updateCategorySchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await courseService.updateCourseCategory(id, result.data);

  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.delete('/categories/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await courseService.deleteCourseCategory(id);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.get('/', authMiddleware, async (ctx) => {
  const { categoryId, teacherId, status, keyword, isHot, page, pageSize } = ctx.query;

  const result = await courseService.getCourses({
    categoryId: categoryId as string,
    teacherId: teacherId as string,
    status: status as 'draft' | 'published' | 'archived',
    keyword: keyword as string,
    isHot: isHot === 'true',
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  });

  ctx.body = { success: true, data: result };
});

router.get('/published', authMiddleware, async (ctx) => {
  const { categoryId, keyword, page, pageSize } = ctx.query;

  const result = await courseService.getPublishedCourses({
    categoryId: categoryId as string,
    keyword: keyword as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  });

  ctx.body = { success: true, data: result };
});

router.get('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const course = await courseService.getCourseById(id);

  if (!course) {
    ctx.status = 404;
    ctx.body = { success: false, message: '课程不存在' };
    return;
  }

  ctx.body = { success: true, data: course };
});

const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startPeriod: z.number().int().min(1),
  endPeriod: z.number().int().min(1),
  location: z.string().min(1, '上课地点不能为空'),
  startWeek: z.number().int().min(1).max(20).optional(),
  endWeek: z.number().int().min(1).max(20).optional(),
});

const createCourseSchema = z.object({
  name: z.string().min(1, '课程名称不能为空'),
  code: z.string().min(1, '课程编码不能为空'),
  categoryId: z.string().min(1, '课程分类不能为空'),
  teacherId: z.string().min(1, '授课教师不能为空'),
  credit: z.number().min(0, '学分不能为负数'),
  totalHours: z.number().int().min(0).optional(),
  maxStudents: z.number().int().min(1).optional(),
  description: z.string().optional(),
  syllabus: z.string().optional(),
  prerequisites: z.string().optional(),
  assessmentMethod: z.string().optional(),
  sortOrder: z.number().int().optional(),
  schedules: z.array(scheduleSchema).optional(),
});

router.post('/', authMiddleware, async (ctx) => {
  const result = createCourseSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message, course } = await courseService.createCourse(result.data);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.status = 201;
  ctx.body = { success: true, message, data: course };
});

const updateCourseSchema = z.object({
  name: z.string().min(1, '课程名称不能为空').optional(),
  categoryId: z.string().optional(),
  teacherId: z.string().optional(),
  credit: z.number().min(0, '学分不能为负数').optional(),
  totalHours: z.number().int().min(0).optional(),
  maxStudents: z.number().int().min(1).optional(),
  description: z.string().optional(),
  syllabus: z.string().optional(),
  prerequisites: z.string().optional(),
  assessmentMethod: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isHot: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.put('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const result = updateCourseSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message } = await courseService.updateCourse(id, result.data);

  if (!success) {
    ctx.status = 404;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.post('/:id/publish', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await courseService.publishCourse(id);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.post('/:id/archive', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await courseService.archiveCourse(id);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

export default router;
