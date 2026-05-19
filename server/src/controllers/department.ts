import type { Response } from 'express';
import { db } from '../database/init';
import { success, error } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Department } from '../types';
import { logOperation } from '../utils/operationLog';

export async function getDepartments(_req: AuthRequest, res: Response): Promise<void> {
  const departments = db
    .prepare('SELECT * FROM departments WHERE is_active = 1 ORDER BY sort_order, id')
    .all() as Department[];

  res.json(success(departments));
}

export async function getAllDepartments(_req: AuthRequest, res: Response): Promise<void> {
  const departments = db
    .prepare('SELECT * FROM departments ORDER BY sort_order, id')
    .all() as Department[];

  res.json(success(departments));
}

export async function createDepartment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const { name, description, sort_order, icon } = req.body as Partial<Department>;

  const existing = db.prepare('SELECT id FROM departments WHERE name = ?').get(name);
  if (existing) {
    res.json(error('科室名称已存在'));
    return;
  }

  const result = db
    .prepare(
      'INSERT INTO departments (name, description, sort_order, icon, is_active) VALUES (?, ?, ?, ?, 1)'
    )
    .run(name, description, sort_order || 0, icon);

  logOperation(req.user.userId, `创建科室: ${name}`, 'department', req.ip);

  res.json(success({ id: result.lastInsertRowid }));
}

export async function updateDepartment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);
  const { name, description, sort_order, is_active, icon } = req.body as Partial<Department>;

  const existing = db.prepare('SELECT id FROM departments WHERE name = ? AND id != ?').get(name, id);
  if (existing) {
    res.json(error('科室名称已存在'));
    return;
  }

  db.prepare(
    `UPDATE departments SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      sort_order = COALESCE(?, sort_order),
      is_active = COALESCE(?, is_active),
      icon = COALESCE(?, icon)
     WHERE id = ?`
  ).run(name, description, sort_order, is_active, icon, id);

  logOperation(req.user.userId, `更新科室: ${id}`, 'department', req.ip);

  res.json(success(null, '更新成功'));
}

export async function deleteDepartment(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.json(error('未授权'));
    return;
  }

  const id = parseInt(req.params.id, 10);

  const hasDoctors = db.prepare('SELECT COUNT(*) as count FROM users WHERE department_id = ?').get(id);
  if ((hasDoctors as { count: number }).count > 0) {
    res.json(error('该科室下还有医生，无法删除'));
    return;
  }

  db.prepare('DELETE FROM departments WHERE id = ?').run(id);

  logOperation(req.user.userId, `删除科室: ${id}`, 'department', req.ip);

  res.json(success(null, '删除成功'));
}
