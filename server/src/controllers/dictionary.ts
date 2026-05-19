import type { Response } from 'express';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Dictionary } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getDictionary(req: AuthRequest, res: Response): Promise<void> {
  const type = req.params.type;

  const items = db
    .prepare('SELECT * FROM dictionaries WHERE type = ? ORDER BY sort_order, id')
    .all(type) as Dictionary[];

  res.json(success(items));
}

export async function getAllDictionaries(_req: AuthRequest, res: Response): Promise<void> {
  const items = db
    .prepare('SELECT * FROM dictionaries ORDER BY type, sort_order, id')
    .all() as Dictionary[];

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Dictionary[]>);

  res.json(success(grouped));
}

export async function createDictionary(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { type, code, name, parent_code, sort_order } = req.body as Dictionary;

  const existing = db
    .prepare('SELECT id FROM dictionaries WHERE type = ? AND code = ?')
    .get(type, code);
  if (existing) {
    res.json(error('该类型下编码已存在'));
    return;
  }

  db.prepare(
    'INSERT INTO dictionaries (type, code, name, parent_code, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(type, code, name, parent_code, sort_order || 0);

  logOperation(req.user.userId, `创建字典: ${type}/${code}`, 'dictionary', req.ip);

  res.json(success(null, '创建成功'));
}

export async function updateDictionary(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { name, sort_order } = req.body as Partial<Dictionary>;

  db.prepare(
    `UPDATE dictionaries SET 
      name = COALESCE(?, name),
      sort_order = COALESCE(?, sort_order)
     WHERE id = ?`
  ).run(name, sort_order, id);

  logOperation(req.user.userId, `更新字典: ${id}`, 'dictionary', req.ip);

  res.json(success(null, '更新成功'));
}

export async function deleteDictionary(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  db.prepare('DELETE FROM dictionaries WHERE id = ?').run(id);

  logOperation(req.user.userId, `删除字典: ${id}`, 'dictionary', req.ip);

  res.json(success(null, '删除成功'));
}

export async function getOperationLogs(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
  const offset = (page - 1) * pageSize;

  const logs = db
    .prepare(
      `SELECT ol.*, u.real_name as user_name 
       FROM operation_logs ol 
       LEFT JOIN users u ON ol.user_id = u.id 
       ORDER BY ol.created_at DESC 
       LIMIT ? OFFSET ?`
    )
    .all(pageSize, offset);

  const total = (
    db.prepare('SELECT COUNT(*) as count FROM operation_logs').get() as { count: number }
  ).count;

  res.json(
    success({
      list: logs,
      total,
      page,
      pageSize,
    })
  );
}
