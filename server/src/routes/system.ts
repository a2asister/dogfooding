import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import db from '../db';
import { success, PaginationResult } from '../utils/response';
import { logOperation } from '../utils/logger';

const router = new Router({ prefix: '/api/system' });

router.get('/configs', async (ctx) => {
  const configs = db.prepare('SELECT * FROM system_configs ORDER BY id').all() as any[];
  ctx.body = success(configs.map(c => ({
    id: c.id,
    configKey: c.config_key,
    configValue: c.config_value,
    description: c.description,
    updatedAt: c.updated_at,
  })));
});

router.put('/configs/:key', async (ctx) => {
  const { key } = ctx.params;
  const { configValue, description } = ctx.request.body as any;

  db.prepare(`
    UPDATE system_configs SET config_value = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE config_key = ?
  `).run(configValue, description, key);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '更新系统配置',
    module: '系统配置',
    details: `更新配置 ${key} = ${configValue}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success(null, '更新成功');
});

router.get('/logs', async (ctx) => {
  const { page = 1, pageSize = 20, userId, module, operation, startDate, endDate } = ctx.query as any;
  
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (userId) {
    where += ' AND user_id = ?';
    params.push(userId);
  }
  if (module) {
    where += ' AND module LIKE ?';
    params.push(`%${module}%`);
  }
  if (operation) {
    where += ' AND operation LIKE ?';
    params.push(`%${operation}%`);
  }
  if (startDate) {
    where += ' AND created_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    where += ' AND created_at <= ?';
    params.push(endDate);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM operation_logs ${where}`).get(...params) as { count: number };
  
  const logs = db.prepare(`
    SELECT * FROM operation_logs
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, (page - 1) * pageSize) as any[];

  const result: PaginationResult<any> = {
    list: logs.map(l => ({
      id: l.id,
      userId: l.user_id,
      username: l.username,
      operation: l.operation,
      module: l.module,
      details: l.details,
      ipAddress: l.ip_address,
      userAgent: l.user_agent,
      createdAt: l.created_at,
    })),
    total: total.count,
    page: Number(page),
    pageSize: Number(pageSize),
  };

  ctx.body = success(result);
});

router.post('/backup', async (ctx) => {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `kpi-backup-${timestamp}.db`);
  const sourcePath = path.join(__dirname, '../../data/kpi.db');

  fs.copyFileSync(sourcePath, backupPath);

  logOperation({
    userId: ctx.user?.userId,
    username: ctx.user?.username,
    operation: '手动数据备份',
    module: '系统配置',
    details: `备份文件: ${backupPath}`,
    ipAddress: ctx.ip,
  });

  ctx.body = success({ backupPath, timestamp }, '备份成功');
});

router.get('/backups', async (ctx) => {
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) {
    ctx.body = success([]);
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.db'))
    .map(f => {
      const stats = fs.statSync(path.join(backupDir, f));
      return {
        filename: f,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  ctx.body = success(files);
});

router.get('/health', async (ctx) => {
  ctx.body = success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
