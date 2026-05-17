import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const createDashboardSchema = z.object({
  name: z.string().min(1, '大屏名称不能为空').max(100),
  description: z.string().max(500).optional(),
});

const updateDashboardSchema = z.object({
  name: z.string().min(1, '大屏名称不能为空').max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  config: z.any().optional(),
  thumbnail: z.string().optional().nullable(),
});

router.use(authenticateToken);

router.get('/', (req: Request, res: Response) => {
  try {
    const dashboards = db
      .prepare(
        `SELECT id, name, description, thumbnail, created_at, updated_at 
         FROM dashboards 
         WHERE user_id = ? 
         ORDER BY updated_at DESC`
      )
      .all(req.user!.userId);

    res.json({ dashboards });
  } catch (error) {
    console.error('Get dashboards error:', error);
    res.status(500).json({ error: '获取大屏列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const dashboard = db
      .prepare(
        `SELECT id, user_id, name, description, config, thumbnail, created_at, updated_at 
         FROM dashboards 
         WHERE id = ? AND user_id = ?`
      )
      .get(req.params.id, req.user!.userId) as any;

    if (!dashboard) {
      return res.status(404).json({ error: '大屏不存在' });
    }

    res.json({
      dashboard: {
        ...dashboard,
        config: JSON.parse(dashboard.config),
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: '获取大屏详情失败' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const validated = createDashboardSchema.parse(req.body);

    const defaultConfig = JSON.stringify({
      width: 1920,
      height: 1080,
      components: [],
      backgroundColor: '#0f172a',
    });

    const result = db
      .prepare(
        'INSERT INTO dashboards (user_id, name, description, config) VALUES (?, ?, ?, ?)'
      )
      .run(
        req.user!.userId,
        validated.name,
        validated.description || null,
        defaultConfig
      );

    const dashboard = db
      .prepare(
        'SELECT id, name, description, thumbnail, created_at, updated_at FROM dashboards WHERE id = ?'
      )
      .get(result.lastInsertRowid);

    res.status(201).json({ dashboard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create dashboard error:', error);
    res.status(500).json({ error: '创建大屏失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const validated = updateDashboardSchema.parse(req.body);

    const existing = db
      .prepare('SELECT id FROM dashboards WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user!.userId);

    if (!existing) {
      return res.status(404).json({ error: '大屏不存在' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (validated.name !== undefined) {
      updates.push('name = ?');
      values.push(validated.name);
    }
    if (validated.description !== undefined) {
      updates.push('description = ?');
      values.push(validated.description);
    }
    if (validated.config !== undefined) {
      updates.push('config = ?');
      values.push(JSON.stringify(validated.config));
    }
    if (validated.thumbnail !== undefined) {
      updates.push('thumbnail = ?');
      values.push(validated.thumbnail);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(req.params.id);

      db.prepare(`UPDATE dashboards SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const dashboard = db
      .prepare(
        'SELECT id, name, description, thumbnail, created_at, updated_at FROM dashboards WHERE id = ?'
      )
      .get(req.params.id);

    res.json({ dashboard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update dashboard error:', error);
    res.status(500).json({ error: '更新大屏失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = db
      .prepare('SELECT id FROM dashboards WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user!.userId);

    if (!existing) {
      return res.status(404).json({ error: '大屏不存在' });
    }

    db.prepare('DELETE FROM dashboards WHERE id = ?').run(req.params.id);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({ error: '删除大屏失败' });
  }
});

export default router;
