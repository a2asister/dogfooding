import type { Context } from 'koa';
import db from '../models/Database.js';

const sqlController = {
  async connect(ctx: Context): Promise<void> {
    const { dbPath } = ctx.request.body as { dbPath?: string };
    if (!dbPath) {
      ctx.status = 400;
      ctx.body = { success: false, message: '数据库路径不能为空' };
      return;
    }
    const result = db.connect(dbPath);
    ctx.body = result;
  },

  async getTables(ctx: Context): Promise<void> {
    if (!db.isConnected()) {
      ctx.status = 400;
      ctx.body = { success: false, message: '未连接到数据库' };
      return;
    }
    const tables = db.getTables();
    ctx.body = { success: true, data: tables };
  },

  async getTableStructure(ctx: Context): Promise<void> {
    if (!db.isConnected()) {
      ctx.status = 400;
      ctx.body = { success: false, message: '未连接到数据库' };
      return;
    }
    const { tableName } = ctx.params as { tableName: string };
    const structure = db.getTableStructure(tableName);
    ctx.body = { success: true, data: structure };
  },

  async executeSql(ctx: Context): Promise<void> {
    const { sql } = ctx.request.body as { sql?: string };
    if (!sql) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'SQL语句不能为空' };
      return;
    }
    const result = db.executeSql(sql);
    ctx.body = result;
  },

  async getLogs(ctx: Context): Promise<void> {
    const logs = db.getLogs();
    ctx.body = { success: true, data: logs };
  },
};

export default sqlController;
