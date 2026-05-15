import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

interface LogEntry {
  id: number;
  timestamp: string;
  sql: string;
  success: boolean;
  error?: string;
  rowsAffected?: number;
}

class DatabaseManager {
  private db: DatabaseType | null = null;
  private logs: LogEntry[] = [];
  private logId = 1;

  connect(dbPath: string): { success: boolean; message: string } {
    try {
      this.disconnect();
      this.db = new Database(dbPath);
      return { success: true, message: '连接成功' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  disconnect(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  getTables(): string[] {
    if (!this.db) return [];
    const rows = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    return rows.map((row) => row.name);
  }

  getTableStructure(tableName: string): {
    name: string;
    type: string;
    notnull: number;
    pk: number;
  }[] {
    if (!this.db) return [];
    return this.db.prepare(`PRAGMA table_info(${tableName})`).all() as {
      name: string;
      type: string;
      notnull: number;
      pk: number;
    }[];
  }

  executeSql(sql: string): {
    success: boolean;
    data?: unknown[];
    columns?: string[];
    rowsAffected?: number;
    error?: string;
  } {
    if (!this.db) {
      return { success: false, error: '未连接到数据库' };
    }

    try {
      const trimmedSql = sql.trim().toUpperCase();
      const isSelect = trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('PRAGMA');

      if (isSelect) {
        const stmt = this.db.prepare(sql);
        const data = stmt.all() as Record<string, unknown>[];
        const columns = data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];
        this.addLog(sql, true);
        return { success: true, data, columns };
      } else {
        const result = this.db.prepare(sql).run();
        this.addLog(sql, true, result.changes);
        return { success: true, rowsAffected: result.changes };
      }
    } catch (error) {
      this.addLog(sql, false, undefined, (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  }

  private addLog(
    sql: string,
    success: boolean,
    rowsAffected?: number,
    error?: string
  ): void {
    this.logs.unshift({
      id: this.logId++,
      timestamp: new Date().toISOString(),
      sql,
      success,
      rowsAffected,
      error,
    });
    if (this.logs.length > 100) {
      this.logs.pop();
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}

export default new DatabaseManager();
