import db from '../database/db';

export interface OperationLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  module?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const operationLogModel = {
  create: (log: Omit<OperationLog, 'id' | 'created_at'>): number => {
    const stmt = db.prepare(`
      INSERT INTO operation_logs (user_id, username, action, module, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      log.user_id || null,
      log.username || '',
      log.action,
      log.module || '',
      log.details || '',
      log.ip_address || '',
      log.user_agent || ''
    );
    return result.lastInsertRowid as number;
  },

  getAll: (params: {
    page?: number;
    pageSize?: number;
    user_id?: number;
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): { list: OperationLog[]; total: number; page: number; pageSize: number } => {
    const { page = 1, pageSize = 20, user_id, module, action, startDate, endDate } = params;

    let whereSql = 'WHERE 1=1';
    const countParams: any[] = [];
    const queryParams: any[] = [];

    if (user_id) {
      whereSql += ' AND user_id = ?';
      countParams.push(user_id);
      queryParams.push(user_id);
    }
    if (module) {
      whereSql += ' AND module = ?';
      countParams.push(module);
      queryParams.push(module);
    }
    if (action) {
      whereSql += ' AND action LIKE ?';
      countParams.push(`%${action}%`);
      queryParams.push(`%${action}%`);
    }
    if (startDate) {
      whereSql += ' AND DATE(created_at) >= ?';
      countParams.push(startDate);
      queryParams.push(startDate);
    }
    if (endDate) {
      whereSql += ' AND DATE(created_at) <= ?';
      countParams.push(endDate);
      queryParams.push(endDate);
    }

    const total = (db.prepare(`SELECT COUNT(*) as count FROM operation_logs ${whereSql}`).get(...countParams) as { count: number }).count;

    queryParams.push((page - 1) * pageSize, pageSize);

    const list = db.prepare(`
      SELECT * FROM operation_logs ${whereSql}
      ORDER BY created_at DESC
      LIMIT ?, ?
    `).all(...queryParams) as OperationLog[];

    return { list, total, page, pageSize };
  }
};
