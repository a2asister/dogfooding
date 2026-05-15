import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ButtonAnimationConfig } from './types';

const DB_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DB_DIR, 'button-templates.db');

export class TemplateDatabase {
  private db: Database.Database;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.db = new Database(DB_PATH);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  getAllTemplates(): ButtonAnimationConfig[] {
    const rows = this.db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all() as any[];
    return rows.map(row => ({
      ...JSON.parse(row.config),
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  getTemplateById(id: string): ButtonAnimationConfig | null {
    const row = this.db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      ...JSON.parse(row.config),
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  createTemplate(config: ButtonAnimationConfig): ButtonAnimationConfig {
    const id = crypto.randomUUID();
    const configToSave = JSON.stringify({ ...config, id: undefined });
    this.db.prepare(`
      INSERT INTO templates (id, name, config)
      VALUES (?, ?, ?)
    `).run(id, config.name, configToSave);
    return this.getTemplateById(id)!;
  }

  updateTemplate(id: string, config: ButtonAnimationConfig): ButtonAnimationConfig | null {
    const configToSave = JSON.stringify({ ...config, id: undefined });
    const result = this.db.prepare(`
      UPDATE templates 
      SET name = ?, config = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(config.name, configToSave, id);
    if (result.changes === 0) return null;
    return this.getTemplateById(id);
  }

  deleteTemplate(id: string): boolean {
    const result = this.db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    return result.changes > 0;
  }

  bulkImport(templates: ButtonAnimationConfig[]): ButtonAnimationConfig[] {
    const inserted: ButtonAnimationConfig[] = [];
    const insert = this.db.prepare(`
      INSERT INTO templates (id, name, config)
      VALUES (?, ?, ?)
    `);
    const transaction = this.db.transaction((tempList) => {
      for (const config of tempList) {
        const id = crypto.randomUUID();
        const configToSave = JSON.stringify({ ...config, id: undefined });
        insert.run(id, config.name, configToSave);
        inserted.push({ ...config, id });
      }
    });
    transaction(templates);
    return inserted;
  }
}

export const db = new TemplateDatabase();
