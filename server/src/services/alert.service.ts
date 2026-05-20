import { v4 as uuidv4 } from 'uuid';
import { executeQuery, runQuery } from '../db';
import type { Alert, AlertLevel, AlertType } from '../types';

export const alertService = {
  create(
    type: AlertType,
    level: AlertLevel,
    title: string,
    message: string,
    module: string,
    relatedId?: string
  ): Alert {
    const now = Date.now();
    const id = uuidv4();
    executeQuery(
      `INSERT INTO alerts (id, type, level, title, message, related_id, module, read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, type, level, title, message, relatedId || null, module, now]
    );
    return {
      id,
      type,
      level,
      title,
      message,
      relatedId,
      module,
      read: false,
      createdAt: now,
    };
  },

  list(params: { page?: number; pageSize?: number; read?: boolean; level?: AlertLevel }): {
    alerts: Alert[];
    total: number;
    unreadCount: number;
  } {
    const { page = 1, pageSize = 20, read, level } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (read !== undefined) {
      where.push('read = ?');
      sqlParams.push(read ? 1 : 0);
    }
    if (level) {
      where.push('level = ?');
      sqlParams.push(level);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const alerts = runQuery<Alert>(
      `SELECT * FROM alerts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    ).map(alert => ({
      ...alert,
      read: (alert.read as unknown as number) === 1,
    }));

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM alerts ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    const unreadResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM alerts WHERE read = 0`,
      []
    );
    const unreadCount = unreadResult[0]?.count || 0;

    return { alerts, total, unreadCount };
  },

  markAsRead(ids: string[]): void {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    executeQuery(`UPDATE alerts SET read = 1 WHERE id IN (${placeholders})`, ids);
  },

  markAllAsRead(): void {
    executeQuery(`UPDATE alerts SET read = 1 WHERE read = 0`, []);
  },

  delete(id: string): void {
    executeQuery(`DELETE FROM alerts WHERE id = ?`, [id]);
  },

  clearOld(days: number = 30): void {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    executeQuery(`DELETE FROM alerts WHERE created_at < ? AND read = 1`, [cutoff]);
  },
};
