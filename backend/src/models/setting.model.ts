import db from '../database/db';
import type { Setting } from '../types';

export const settingModel = {
  getAll(): Setting[] {
    return db.prepare('SELECT * FROM settings ORDER BY id ASC').all() as Setting[];
  },

  getByKey(key: string): Setting | undefined {
    return db.prepare('SELECT * FROM settings WHERE key = ?').get(key) as Setting | undefined;
  },

  update(key: string, value: string): boolean {
    const result = db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(value, key);
    return result.changes > 0;
  },

  create(data: Omit<Setting, 'id'>): number {
    const result = db.prepare(`
      INSERT INTO settings (key, value, description)
      VALUES (?, ?, ?)
    `).run(data.key, data.value, data.description);
    return Number(result.lastInsertRowid);
  }
};
