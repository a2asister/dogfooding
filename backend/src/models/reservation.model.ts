import db from '../database/db';
import type { Reservation } from '../types';

export const reservationModel = {
  getList(params: { page: number; pageSize: number }): { list: Reservation[]; total: number } {
    const { page, pageSize } = params;
    const offset = (page - 1) * pageSize;
    
    const list = db.prepare(`
      SELECT * FROM reservations 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(pageSize, offset) as Reservation[];
    
    const totalResult = db.prepare('SELECT COUNT(*) as total FROM reservations').get() as { total: number };
    
    return { list, total: totalResult.total };
  },

  create(data: Omit<Reservation, 'id' | 'created_at'>): number {
    const result = db.prepare(`
      INSERT INTO reservations (phone, platform)
      VALUES (?, ?)
    `).run(data.phone, data.platform);
    return Number(result.lastInsertRowid);
  },

  hasPhone(phone: string): boolean {
    const result = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE phone = ?').get(phone) as { count: number };
    return result.count > 0;
  },

  getTotalCount(): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM reservations').get() as { count: number };
    return result.count;
  }
};
