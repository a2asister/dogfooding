import db from '../database/db';
import type { Event } from '../types';

export const eventModel = {
  getList(params: { page: number; pageSize: number; status?: string }): { list: Event[]; total: number } {
    const { page, pageSize, status } = params;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'is_published = 1';
    const queryParams: (string | number)[] = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }
    
    const list = db.prepare(`
      SELECT * FROM events 
      WHERE ${whereClause} 
      ORDER BY sort_order ASC, created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...queryParams, pageSize, offset) as Event[];
    
    const totalResult = db.prepare(`
      SELECT COUNT(*) as total FROM events WHERE ${whereClause}
    `).get(...queryParams) as { total: number };
    
    return { list, total: totalResult.total };
  },

  getAdminList(params: { page: number; pageSize: number }): { list: Event[]; total: number } {
    const { page, pageSize } = params;
    const offset = (page - 1) * pageSize;
    
    const list = db.prepare(`
      SELECT * FROM events 
      ORDER BY sort_order ASC, created_at DESC 
      LIMIT ? OFFSET ?
    `).all(pageSize, offset) as Event[];
    
    const totalResult = db.prepare('SELECT COUNT(*) as total FROM events').get() as { total: number };
    
    return { list, total: totalResult.total };
  },

  getById(id: number): Event | undefined {
    return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | undefined;
  },

  create(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): number {
    const result = db.prepare(`
      INSERT INTO events (title, description, cover_image, start_time, end_time, status, is_published, link_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title, data.description, data.cover_image, data.start_time, 
      data.end_time, data.status, data.is_published, data.link_url, data.sort_order
    );
    return Number(result.lastInsertRowid);
  },

  update(id: number, data: Partial<Omit<Event, 'id' | 'created_at'>>): boolean {
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    values.push(id);
    
    const result = db.prepare(`UPDATE events SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getOngoing(limit: number = 3): Event[] {
    return db.prepare(`
      SELECT * FROM events 
      WHERE is_published = 1 AND status = 'ongoing'
      ORDER BY sort_order ASC, created_at DESC 
      LIMIT ?
    `).all(limit) as Event[];
  }
};
