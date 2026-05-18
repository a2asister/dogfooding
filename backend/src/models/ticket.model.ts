import db from '../database/db';
import type { Ticket } from '../types';

export const ticketModel = {
  getList(params: { page: number; pageSize: number; status?: string }): { list: Ticket[]; total: number } {
    const { page, pageSize, status } = params;
    const offset = (page - 1) * pageSize;
    
    let whereClause = '1=1';
    const queryParams: (string | number)[] = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }
    
    const list = db.prepare(`
      SELECT * FROM tickets 
      WHERE ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...queryParams, pageSize, offset) as Ticket[];
    
    const totalResult = db.prepare(`
      SELECT COUNT(*) as total FROM tickets WHERE ${whereClause}
    `).get(...queryParams) as { total: number };
    
    return { list, total: totalResult.total };
  },

  getById(id: number): Ticket | undefined {
    return db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Ticket | undefined;
  },

  create(data: Omit<Ticket, 'id' | 'status' | 'reply' | 'replied_at' | 'created_at'>): number {
    const result = db.prepare(`
      INSERT INTO tickets (user_name, contact, title, content)
      VALUES (?, ?, ?, ?)
    `).run(data.user_name, data.contact, data.title, data.content);
    return Number(result.lastInsertRowid);
  },

  reply(id: number, reply: string): boolean {
    const result = db.prepare(`
      UPDATE tickets 
      SET reply = ?, status = 'replied', replied_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(reply, id);
    return result.changes > 0;
  },

  updateStatus(id: number, status: string): boolean {
    const result = db.prepare('UPDATE tickets SET status = ? WHERE id = ?').run(status, id);
    return result.changes > 0;
  }
};
