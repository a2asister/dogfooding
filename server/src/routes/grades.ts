import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import { Grade, Class } from '../models';
import { z } from 'zod';

const router = new Router({ prefix: '/api/grades' });

router.get('/', authMiddleware, async (ctx) => {
  const result = await Grade.findAll({
    include: [{ association: 'classes', attributes: ['id', 'name'] }],
    order: [['year', 'DESC'], ['name', 'ASC']],
  });

  ctx.body = { success: true, data: result };
});

router.get('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const grade = await Grade.findByPk(id, {
    include: [{ association: 'classes', attributes: ['id', 'name'] }],
  });

  if (!grade) {
    ctx.status = 404;
    ctx.body = { success: false, message: '年级不存在' };
    return;
  }

  ctx.body = { success: true, data: grade };
});

const createGradeSchema = z.object({
  name: z.string().min(1, '年级名称不能为空'),
  year: z.string().min(1, '学年不能为空'),
  description: z.string().optional(),
});

router.post('/', authMiddleware, async (ctx) => {
  const result = createGradeSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const grade = await Grade.create(result.data);

  ctx.status = 201;
  ctx.body = { success: true, message: '创建成功', data: grade };
});

const updateGradeSchema = z.object({
  name: z.string().min(1, '年级名称不能为空').optional(),
  year: z.string().min(1, '学年不能为空').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.put('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const result = updateGradeSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const grade = await Grade.findByPk(id);
  if (!grade) {
    ctx.status = 404;
    ctx.body = { success: false, message: '年级不存在' };
    return;
  }

  await Grade.update(result.data, { where: { id } });

  ctx.body = { success: true, message: '更新成功' };
});

router.delete('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const grade = await Grade.findByPk(id);

  if (!grade) {
    ctx.status = 404;
    ctx.body = { success: false, message: '年级不存在' };
    return;
  }

  const classCount = await Class.count({ where: { gradeId: id } });
  if (classCount > 0) {
    ctx.status = 400;
    ctx.body = { success: false, message: '该年级下还有班级，无法删除' };
    return;
  }

  await Grade.destroy({ where: { id } });

  ctx.body = { success: true, message: '删除成功' };
});

router.get('/:gradeId/classes', authMiddleware, async (ctx) => {
  const { gradeId } = ctx.params;
  const classes = await Class.findAll({
    where: { gradeId },
    order: [['name', 'ASC']],
  });

  ctx.body = { success: true, data: classes };
});

router.post('/:gradeId/classes', authMiddleware, async (ctx) => {
  const { gradeId } = ctx.params;
  const schema = z.object({
    name: z.string().min(1, '班级名称不能为空'),
    description: z.string().optional(),
  });

  const result = schema.safeParse(ctx.request.body);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const cls = await Class.create({
    ...result.data,
    gradeId,
  });

  ctx.status = 201;
  ctx.body = { success: true, message: '创建成功', data: cls };
});

router.put('/:gradeId/classes/:classId', authMiddleware, async (ctx) => {
  const { classId } = ctx.params;
  const schema = z.object({
    name: z.string().min(1, '班级名称不能为空').optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  });

  const result = schema.safeParse(ctx.request.body);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const cls = await Class.findByPk(classId);
  if (!cls) {
    ctx.status = 404;
    ctx.body = { success: false, message: '班级不存在' };
    return;
  }

  await Class.update(result.data, { where: { id: classId } });

  ctx.body = { success: true, message: '更新成功' };
});

router.delete('/:gradeId/classes/:classId', authMiddleware, async (ctx) => {
  const { classId } = ctx.params;
  const cls = await Class.findByPk(classId);

  if (!cls) {
    ctx.status = 404;
    ctx.body = { success: false, message: '班级不存在' };
    return;
  }

  await Class.destroy({ where: { id: classId } });

  ctx.body = { success: true, message: '删除成功' };
});

export default router;
