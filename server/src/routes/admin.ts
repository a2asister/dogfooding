import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { UserRole, AuthStatus, AuctionStatus, OrderStatus } from '../types';

const router = new Router({ prefix: '/api/admin' });

router.get('/users', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const { page = 1, pageSize = 20, authStatus, role } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let whereClause = 'WHERE 1=1';
  const params: unknown[] = [];

  if (authStatus) {
    whereClause += ' AND authStatus = ?';
    params.push(authStatus);
  }

  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  const users = db.prepare(`
    SELECT id, phone, nickname, role, realName, authStatus, balance, frozenBalance, createdAt
    FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`).get(...params) as { count: number };

  ctx.body = { code: 200, data: { users, total: total.count } };
});

router.post('/user/:id/auth', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const userId = Number(ctx.params.id);
  const { status, reason } = ctx.request.body as { status: string; reason?: string };

  db.prepare(`
    UPDATE users SET authStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
  `).run(status, userId);

  db.prepare(`
    INSERT INTO messages (userId, type, title, content)
    VALUES (?, 'system', ?, ?)
  `).run(userId, '实名认证审核结果', 
    status === AuthStatus.VERIFIED ? '恭喜您，实名认证已通过！' : `实名认证未通过：${reason || '信息不符'}`
  );

  ctx.body = { code: 200, message: '审核完成' };
});

router.get('/merchants', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const { page = 1, pageSize = 20, authStatus } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let whereClause = 'WHERE 1=1';
  const params: unknown[] = [];

  if (authStatus) {
    whereClause += ' AND m.authStatus = ?';
    params.push(authStatus);
  }

  const merchants = db.prepare(`
    SELECT m.*, u.phone, u.nickname
    FROM merchants m
    INNER JOIN users u ON m.userId = u.id
    ${whereClause} ORDER BY m.createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM merchants m ${whereClause}`).get(...params) as { count: number };

  ctx.body = { code: 200, data: { merchants, total: total.count } };
});

router.post('/merchant/:id/auth', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const merchantId = Number(ctx.params.id);
  const { status, reason } = ctx.request.body as { status: string; reason?: string };

  const merchant = db.prepare('SELECT userId FROM merchants WHERE id = ?').get(merchantId) as { userId: number };

  db.prepare(`
    UPDATE merchants SET authStatus = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
  `).run(status, merchantId);

  db.prepare(`
    INSERT INTO messages (userId, type, title, content)
    VALUES (?, 'system', ?, ?)
  `).run(merchant.userId, '商家资质审核结果', 
    status === AuthStatus.VERIFIED ? '恭喜您，商家资质认证已通过！' : `资质认证未通过：${reason || '信息不符'}`
  );

  ctx.body = { code: 200, message: '审核完成' };
});

router.get('/auctions', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const { page = 1, pageSize = 20, auditStatus, status } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let whereClause = 'WHERE 1=1';
  const params: unknown[] = [];

  if (auditStatus) {
    whereClause += ' AND auditStatus = ?';
    params.push(auditStatus);
  }

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  const auctions = db.prepare(`
    SELECT a.*, m.companyName
    FROM auction_items a
    INNER JOIN merchants m ON a.merchantId = m.id
    ${whereClause} ORDER BY a.createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM auction_items a ${whereClause}`).get(...params) as { count: number };

  ctx.body = { code: 200, data: { auctions, total: total.count } };
});

router.post('/auction/:id/audit', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const auctionId = Number(ctx.params.id);
  const { status, reason } = ctx.request.body as { status: string; reason?: string };

  db.prepare(`
    UPDATE auction_items SET auditStatus = ?, auditReason = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, reason || '', auctionId);

  if (status === AuthStatus.VERIFIED) {
    db.prepare(`
      UPDATE auction_items SET status = ? WHERE id = ?
    `).run(AuctionStatus.PENDING, auctionId);
  }

  const auction = db.prepare(`
    SELECT a.title, m.userId
    FROM auction_items a
    INNER JOIN merchants m ON a.merchantId = m.id
    WHERE a.id = ?
  `).get(auctionId) as { title: string; userId: number };

  db.prepare(`
    INSERT INTO messages (userId, type, title, content)
    VALUES (?, 'system', ?, ?)
  `).run(auction.userId, '商品审核结果', 
    status === AuthStatus.VERIFIED 
      ? `商品「${auction.title}」审核通过，即将开拍` 
      : `商品「${auction.title}」审核未通过：${reason || '不符合规范'}`
  );

  ctx.body = { code: 200, message: '审核完成' };
});

router.get('/orders', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const { page = 1, pageSize = 20, status } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    conditions.push('o.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const orders = db.prepare(`
    SELECT o.*, a.title as auctionTitle, 
           buyer.nickname as buyerName, seller.nickname as sellerName
    FROM orders o
    INNER JOIN auction_items a ON o.auctionId = a.id
    INNER JOIN users buyer ON o.buyerId = buyer.id
    INNER JOIN users seller ON o.sellerId = seller.id
    ${whereClause} ORDER BY o.createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o ${whereClause}`).get(...params) as { count: number };

  ctx.body = { code: 200, data: { orders, total: total.count } };
});

router.get('/configs', authMiddleware([UserRole.ADMIN]), async (ctx) => {
  const configs = db.prepare('SELECT * FROM system_configs').all();
  ctx.body = { code: 200, data: configs };
});

router.post('/config', authMiddleware([UserRole.ADMIN]), async (ctx) => {
  const { key, value, description } = ctx.request.body as { key: string; value: string; description?: string };

  const existing = db.prepare('SELECT id FROM system_configs WHERE key = ?').get(key);
  
  if (existing) {
    db.prepare(`
      UPDATE system_configs SET value = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE key = ?
    `).run(value, description || '', key);
  } else {
    db.prepare(`
      INSERT INTO system_configs (key, value, description)
      VALUES (?, ?, ?)
    `).run(key, value, description || '');
  }

  ctx.body = { code: 200, message: '配置已更新' };
});

router.get('/statistics', authMiddleware([UserRole.ADMIN, UserRole.OPERATOR]), async (ctx) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const merchantCount = db.prepare('SELECT COUNT(*) as count FROM merchants WHERE authStatus = ?').get(AuthStatus.VERIFIED) as { count: number };
  const auctionCount = db.prepare('SELECT COUNT(*) as count FROM auction_items WHERE status = ?').get(AuctionStatus.ACTIVE) as { count: number };
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  
  const totalAmount = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = ?').get(OrderStatus.COMPLETED) as { total: number };
  const totalCommission = db.prepare('SELECT COALESCE(SUM(commissionAmount), 0) as total FROM orders WHERE status = ?').get(OrderStatus.COMPLETED) as { total: number };

  const recentOrders = db.prepare(`
    SELECT DATE(createdAt) as date, COUNT(*) as count, SUM(amount) as amount
    FROM orders WHERE createdAt >= DATE('now', '-7 days')
    GROUP BY DATE(createdAt) ORDER BY date DESC
  `).all();

  ctx.body = {
    code: 200,
    data: {
      userCount: userCount.count,
      merchantCount: merchantCount.count,
      auctionCount: auctionCount.count,
      orderCount: orderCount.count,
      totalAmount: totalAmount.total,
      totalCommission: totalCommission.total,
      recentOrders
    }
  };
});

export default router;
