import db from '../database/db';
import type { News } from '../types';

export const newsModel = {
  getList(params: { page: number; pageSize: number; category?: string; keyword?: string }): { list: News[]; total: number } {
    const { page, pageSize, category, keyword } = params;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'status = \'published\'';
    const queryParams: (string | number)[] = [];
    
    if (category) {
      whereClause += ' AND category = ?';
      queryParams.push(category);
    }
    
    if (keyword) {
      whereClause += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      queryParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    const list = db.prepare(`
      SELECT * FROM news 
      WHERE ${whereClause} 
      ORDER BY is_top DESC, created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...queryParams, pageSize, offset) as News[];
    
    const totalResult = db.prepare(`
      SELECT COUNT(*) as total FROM news WHERE ${whereClause}
    `).get(...queryParams) as { total: number };
    
    return { list, total: totalResult.total };
  },

  getById(id: number): News | undefined {
    return db.prepare('SELECT * FROM news WHERE id = ?').get(id) as News | undefined;
  },

  getPrevNext(id: number): { prev: News | null; next: News | null } {
    const current = db.prepare('SELECT created_at FROM news WHERE id = ?').get(id) as { created_at: string } | undefined;
    if (!current) return { prev: null, next: null };

    const prev = db.prepare(`
      SELECT id, title FROM news 
      WHERE created_at > ? AND status = 'published'
      ORDER BY created_at ASC 
      LIMIT 1
    `).get(current.created_at) as News | undefined;

    const next = db.prepare(`
      SELECT id, title FROM news 
      WHERE created_at < ? AND status = 'published'
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(current.created_at) as News | undefined;

    return { prev: prev || null, next: next || null };
  },

  getHotRecommend(limit: number = 5): News[] {
    return db.prepare(`
      SELECT * FROM news 
      WHERE status = 'published' AND (is_hot = 1 OR is_recommend = 1)
      ORDER BY is_top DESC, view_count DESC, created_at DESC 
      LIMIT ?
    `).all(limit) as News[];
  },

  incrementShareCount(id: number): void {
    db.prepare('UPDATE news SET share_count = COALESCE(share_count, 0) + 1 WHERE id = ?').run(id);
  },

  create(data: Omit<News, 'id' | 'view_count' | 'created_at' | 'updated_at'>): number {
    const result = db.prepare(`
      INSERT INTO news (title, content, category, cover_image, is_top)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.title, data.content, data.category, data.cover_image, data.is_top);
    return Number(result.lastInsertRowid);
  },

  update(id: number, data: Partial<Omit<News, 'id' | 'created_at'>>): boolean {
    const fields = Object.keys(data)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    values.push(id);
    
    const result = db.prepare(`UPDATE news SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM news WHERE id = ?').run(id);
    return result.changes > 0;
  },

  incrementViewCount(id: number): void {
    db.prepare('UPDATE news SET view_count = view_count + 1 WHERE id = ?').run(id);
  },

  getLatest(limit: number = 3): News[] {
    return db.prepare(`
      SELECT * FROM news 
      ORDER BY is_top DESC, created_at DESC 
      LIMIT ?
    `).all(limit) as News[];
  }
};
