import Router from 'koa-router';
import { authMiddleware } from '../middleware/auth';
import * as electiveService from '../services/electiveService';
import { z } from 'zod';

const router = new Router({ prefix: '/api/batches' });

router.get('/', authMiddleware, async (ctx) => {
  const { status, page, pageSize } = ctx.query;

  const result = await electiveService.getBatches({
    status: status as string,
    page: page ? parseInt(page as string) : undefined,
    pageSize: pageSize ? parseInt(pageSize as string) : undefined,
  });

  ctx.body = { success: true, data: result };
});

router.get('/active', authMiddleware, async (ctx) => {
  const result = await electiveService.getActiveBatches();
  ctx.body = { success: true, data: result };
});

router.get('/:id', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const batch = await electiveService.getBatchById(id);

  if (!batch) {
    ctx.status = 404;
    ctx.body = { success: false, message: '批次不存在' };
    return;
  }

  ctx.body = { success: true, data: batch };
});

const createBatchSchema = z.object({
  name: z.string().min(1, '批次名称不能为空'),
  academicYear: z.string().min(1, '学年不能为空'),
  semester: z.string().min(1, '学期不能为空'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  gradeIds: z.array(z.string()),
  maxCredits: z.number().min(0, '最大学分不能为负数'),
  minCredits: z.number().min(0, '最小学分不能为负数'),
  description: z.string().optional(),
});

router.post('/', authMiddleware, async (ctx) => {
  const result = createBatchSchema.safeParse(ctx.request.body);

  if (!result.success) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: '参数错误',
      errors: result.error.flatten().fieldErrors,
    };
    return;
  }

  const { success, message, batch } = await electiveService.createBatch(result.data);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.status = 201;
  ctx.body = { success: true, message, data: batch };
});

router.post('/:id/start', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await electiveService.startBatch(id);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

router.post('/:id/end', authMiddleware, async (ctx) => {
  const { id } = ctx.params;
  const { success, message } = await electiveService.endBatch(id);

  if (!success) {
    ctx.status = 400;
    ctx.body = { success: false, message };
    return;
  }

  ctx.body = { success: true, message };
});

export default router;
