import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuctionStatus, AuthStatus, UserRole } from '../types';

const router = new Router({ prefix: '/api/auction' });

router.get('/list', async (ctx) => {
  const { 
    page = 1, 
    pageSize = 20, 
    category, 
    keyword, 
    status = AuctionStatus.ACTIVE,
    sort = 'newest',
    minPrice,
    maxPrice
  } = ctx.query;

  const offset = (Number(page) - 1) * Number(pageSize);
  
  let whereClause = 'WHERE status = ? AND auditStatus = ?';
  const params: unknown[] = [status, AuthStatus.VERIFIED];

  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }

  if (keyword) {
    whereClause += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (minPrice) {
    whereClause += ' AND currentPrice >= ?';
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    whereClause += ' AND currentPrice <= ?';
    params.push(Number(maxPrice));
  }

  let orderClause = 'ORDER BY createdAt DESC';
  if (sort === 'price_asc') orderClause = 'ORDER BY currentPrice ASC';
  if (sort === 'price_desc') orderClause = 'ORDER BY currentPrice DESC';
  if (sort === 'bids') orderClause = 'ORDER BY bidCount DESC';
  if (sort === 'ending') orderClause = 'ORDER BY endTime ASC';

  const items = db.prepare(`
    SELECT * FROM auction_items ${whereClause} ${orderClause} LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset) as unknown[];

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM auction_items ${whereClause}
  `).get(...params) as { count: number };

  ctx.body = { code: 200, data: { items, total: total.count } };
});

router.get('/:id', async (ctx) => {
  const id = Number(ctx.params.id);
  
  db.prepare('UPDATE auction_items SET viewCount = viewCount + 1 WHERE id = ?').run(id);

  const item = db.prepare('SELECT * FROM auction_items WHERE id = ?').get(id);
  
  if (!item) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '拍卖商品不存在' };
    return;
  }

  const bids = db.prepare(`
    SELECT b.*, u.nickname FROM bids b
    INNER JOIN users u ON b.userId = u.id
    WHERE b.auctionId = ?
    ORDER BY b.createdAt DESC LIMIT 10
  `).all(id);

  ctx.body = { code: 200, data: { ...item as object, bids } };
});

router.get('/:id/bids', async (ctx) => {
  const id = Number(ctx.params.id);
  const { page = 1, pageSize = 20 } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const bids = db.prepare(`
    SELECT b.*, u.nickname FROM bids b
    INNER JOIN users u ON b.userId = u.id
    WHERE b.auctionId = ?
    ORDER BY b.createdAt DESC LIMIT ? OFFSET ?
  `).all(id, Number(pageSize), offset);

  ctx.body = { code: 200, data: bids };
});

router.post('/:id/bid', authMiddleware([UserRole.USER]), async (ctx) => {
  const { userId } = ctx.state.user;
  const auctionId = Number(ctx.params.id);
  const { amount } = ctx.request.body as { amount: number };

  const user = db.prepare('SELECT authStatus, balance FROM users WHERE id = ?').get(userId) as { authStatus: string; balance: number };
  
  if (user.authStatus !== AuthStatus.VERIFIED) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请先完成实名认证' };
    return;
  }

  const auction = db.prepare('SELECT * FROM auction_items WHERE id = ?').get(auctionId) as { 
    id: number; 
    status: string; 
    currentPrice: number; 
    minIncrement: number;
    endTime: string;
    merchantId: number;
  } | undefined;

  if (!auction) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '拍卖商品不存在' };
    return;
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '拍卖未开始或已结束' };
    return;
  }

  if (amount < auction.currentPrice + auction.minIncrement) {
    ctx.status = 400;
    ctx.body = { code: 400, message: `出价必须至少为 ${auction.currentPrice + auction.minIncrement} 元` };
    return;
  }

  const config = db.prepare("SELECT value FROM system_configs WHERE key = 'deposit_rate'").get() as { value: string };
  const depositRate = parseFloat(config.value);
  const depositAmount = amount * depositRate;

  if (user.balance < depositAmount) {
    ctx.status = 400;
    ctx.body = { code: 400, message: `余额不足，需要保证金 ${depositAmount.toFixed(2)} 元` };
    return;
  }

  const extensionConfig = db.prepare("SELECT value FROM system_configs WHERE key = 'bid_extension_time'").get() as { value: string };
  const extensionTime = parseInt(extensionConfig.value);
  const now = Date.now();
  const endTime = new Date(auction.endTime).getTime();
  
  if (endTime - now < extensionTime * 1000) {
    const newEndTime = new Date(now + extensionTime * 1000).toISOString();
    db.prepare('UPDATE auction_items SET endTime = ? WHERE id = ?').run(newEndTime, auctionId);
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance - ?, frozenBalance = frozenBalance + ? WHERE id = ?').run(depositAmount, depositAmount, userId);
    
    db.prepare(`
      INSERT INTO deposit_records (userId, auctionId, amount, type, status, remark)
      VALUES (?, ?, ?, 'freeze', 'frozen', '竞拍保证金冻结')
    `).run(userId, auctionId, depositAmount);

    db.prepare(`
      UPDATE auction_items SET currentPrice = ?, bidCount = bidCount + 1 WHERE id = ?
    `).run(amount, auctionId);

    db.prepare(`
      INSERT INTO bids (auctionId, userId, amount, isAutoBid)
      VALUES (?, ?, ?, 0)
    `).run(auctionId, userId, amount);
  });

  tx();

  ctx.body = { code: 200, message: '出价成功', data: { newPrice: amount } };
});

export default router;
