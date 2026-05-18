import db from '../database/db';
import type { HomeConfig } from '../types';

export const homeConfigModel = {
  getAll(): HomeConfig[] {
    return db.prepare('SELECT * FROM home_config ORDER BY sort_order ASC').all() as HomeConfig[];
  },

  getEnabled(): HomeConfig[] {
    return db.prepare('SELECT * FROM home_config WHERE is_enabled = 1 ORDER BY sort_order ASC').all() as HomeConfig[];
  },

  getByModuleName(moduleName: string): HomeConfig | undefined {
    return db.prepare('SELECT * FROM home_config WHERE module_name = ?').get(moduleName) as HomeConfig | undefined;
  },

  updateByModuleName(moduleName: string, data: { config_data?: string; is_enabled?: number; sort_order?: number }): boolean {
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(data);
    values.push(moduleName);
    
    const result = db.prepare(`UPDATE home_config SET ${fields} WHERE module_name = ?`).run(...values);
    return result.changes > 0;
  },

  create(data: Omit<HomeConfig, 'id'>): number {
    const result = db.prepare(`
      INSERT INTO home_config (module_name, config_data, is_enabled, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(data.module_name, data.config_data, data.is_enabled, data.sort_order);
    return Number(result.lastInsertRowid);
  }
};
