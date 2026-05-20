import { v4 as uuidv4 } from 'uuid';
import { executeQuery, runQuery } from '../db';
import type { AuditLog } from '../types';

export const auditService = {
  log(
    userId: string,
    username: string,
    action: string,
    module: string,
    details: Record<string, unknown> = {},
    targetId?: string,
    ip?: string,
    userAgent?: string
  ): void {
    const now = Date.now();
    executeQuery(
      `INSERT INTO audit_logs (id, user_id, username, action, module, target_id, details, ip, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, username, action, module, targetId || null, JSON.stringify(details), ip || null, userAgent || null, now]
    );
  },

  list(params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    module?: string;
    startTime?: number;
    endTime?: number;
  }): { logs: AuditLog[]; total: number } {
    const { page = 1, pageSize = 20, userId, action, module, startTime, endTime } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (userId) {
      where.push('user_id = ?');
      sqlParams.push(userId);
    }
    if (action) {
      where.push('action = ?');
      sqlParams.push(action);
    }
    if (module) {
      where.push('module = ?');
      sqlParams.push(module);
    }
    if (startTime) {
      where.push('created_at >= ?');
      sqlParams.push(startTime);
    }
    if (endTime) {
      where.push('created_at <= ?');
      sqlParams.push(endTime);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const logs = runQuery<AuditLog>(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    ).map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { logs, total };
  },

  export(params: {
    userId?: string;
    action?: string;
    module?: string;
    startTime?: number;
    endTime?: number;
  }): string {
    const { logs } = this.list({ ...params, page: 1, pageSize: 10000 });
    const headers = ['ID', '用户ID', '用户名', '操作', '模块', '目标ID', '详情', 'IP', 'User Agent', '时间'];
    const rows = logs.map(log => [
      log.id,
      log.userId,
      log.username,
      log.action,
      log.module,
      log.targetId || '',
      JSON.stringify(log.details),
      log.ip || '',
      log.userAgent || '',
      new Date(log.createdAt).toISOString(),
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },
};
