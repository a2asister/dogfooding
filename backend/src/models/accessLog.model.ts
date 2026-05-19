import db from '../database/db';

export interface AccessLog {
  id: number;
  path: string;
  method?: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;
  session_id?: string;
  user_id?: number;
  response_time?: number;
  status_code?: number;
  created_at: string;
}

export const accessLogModel = {
  create: (log: Omit<AccessLog, 'id' | 'created_at'>): number => {
    const stmt = db.prepare(`
      INSERT INTO access_logs (path, method, ip_address, user_agent, referer, session_id, user_id, response_time, status_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      log.path,
      log.method || '',
      log.ip_address || '',
      log.user_agent || '',
      log.referer || '',
      log.session_id || '',
      log.user_id || null,
      log.response_time || 0,
      log.status_code || 200
    );
    return result.lastInsertRowid as number;
  },

  getAll: (params: {
    page?: number;
    pageSize?: number;
    path?: string;
    ip_address?: string;
    startDate?: string;
    endDate?: string;
  }): { list: AccessLog[]; total: number; page: number; pageSize: number } => {
    const { page = 1, pageSize = 20, path, ip_address, startDate, endDate } = params;

    let whereSql = 'WHERE 1=1';
    const countParams: any[] = [];
    const queryParams: any[] = [];

    if (path) {
      whereSql += ' AND path LIKE ?';
      countParams.push(`%${path}%`);
      queryParams.push(`%${path}%`);
    }
    if (ip_address) {
      whereSql += ' AND ip_address = ?';
      countParams.push(ip_address);
      queryParams.push(ip_address);
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

    const total = (db.prepare(`SELECT COUNT(*) as count FROM access_logs ${whereSql}`).get(...countParams) as { count: number }).count;

    queryParams.push((page - 1) * pageSize, pageSize);

    const list = db.prepare(`
      SELECT * FROM access_logs ${whereSql}
      ORDER BY created_at DESC
      LIMIT ?, ?
    `).all(...queryParams) as AccessLog[];

    return { list, total, page, pageSize };
  },

  getUniqueVisitors: (startDate: string, endDate: string): number => {
    return (db.prepare(`
      SELECT COUNT(DISTINCT ip_address) as count 
      FROM access_logs 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `).get(startDate, endDate) as { count: number }).count;
  },

  getPageViews: (startDate: string, endDate: string): number => {
    return (db.prepare(`
      SELECT COUNT(*) as count 
      FROM access_logs 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `).get(startDate, endDate) as { count: number }).count;
  }
};
