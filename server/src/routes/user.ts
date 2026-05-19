import Router from 'koa-router';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthStatus, UserRole } from '../types';

const router = new Router({ prefix: '/api/user' });

const realNameSchema = z.object({
  realName: z.string().min(2, '真实姓名至少2位'),
  idCard: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, '身份证格式不正确')
});

router.get('/profile', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  
  const user = db.prepare(`
    SELECT id, phone, nickname, avatar, role, realName, idCard, authStatus, balance, frozenBalance, createdAt
    FROM users WHERE id = ?
  `).get(userId);

  ctx.body = { code: 200, data: user };
});

router.post('/realname', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const body = realNameSchema.safeParse(ctx.request.body);

  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const { realName, idCard } = body.data;

  db.prepare(`
    UPDATE users SET realName = ?, idCard = ?, authStatus = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(realName, idCard, AuthStatus.PENDING, userId);

  ctx.body = { code: 200, message: '实名认证提交成功，等待审核' };
});

router.post('/deposit/recharge', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { amount } = ctx.request.body as { amount: number };

  if (!amount || amount <= 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '充值金额必须大于0' };
    return;
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance + ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(amount, userId);
    db.prepare(`
      INSERT INTO deposit_records (userId, amount, type, status, remark)
      VALUES (?, ?, 'recharge', 'released', '账户充值')
    `).run(userId, amount);
  });

  tx();

  ctx.body = { code: 200, message: '充值成功' };
});

router.post('/deposit/withdraw', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { amount } = ctx.request.body as { amount: number };

  if (!amount || amount <= 0) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '提现金额必须大于0' };
    return;
  }

  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
  
  if (user.balance < amount) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '余额不足' };
    return;
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE users SET balance = balance - ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(amount, userId);
    db.prepare(`
      INSERT INTO deposit_records (userId, amount, type, status, remark)
      VALUES (?, ?, 'withdraw', 'released', '账户提现')
    `).run(userId, amount);
  });

  tx();

  ctx.body = { code: 200, message: '提现成功' };
});

router.get('/deposit/records', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20 } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const records = db.prepare(`
    SELECT * FROM deposit_records WHERE userId = ?
    ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `).all(userId, Number(pageSize), offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM deposit_records WHERE userId = ?').get(userId) as { count: number };

  ctx.body = { code: 200, data: { records, total: total.count } };
});

router.get('/favorites', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20 } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const favorites = db.prepare(`
    SELECT a.* FROM auction_items a
    INNER JOIN favorites f ON a.id = f.auctionId
    WHERE f.userId = ?
    ORDER BY f.createdAt DESC LIMIT ? OFFSET ?
  `).all(userId, Number(pageSize), offset);

  ctx.body = { code: 200, data: favorites };
});

router.post('/favorite/:auctionId', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const auctionId = Number(ctx.params.auctionId);

  try {
    db.prepare('INSERT INTO favorites (userId, auctionId) VALUES (?, ?)').run(userId, auctionId);
    db.prepare('UPDATE auction_items SET favoriteCount = favoriteCount + 1 WHERE id = ?').run(auctionId);
    ctx.body = { code: 200, message: '收藏成功' };
  } catch {
    ctx.body = { code: 200, message: '已收藏' };
  }
});

router.delete('/favorite/:auctionId', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const auctionId = Number(ctx.params.auctionId);

  db.prepare('DELETE FROM favorites WHERE userId = ? AND auctionId = ?').run(userId, auctionId);
  db.prepare('UPDATE auction_items SET favoriteCount = favoriteCount - 1 WHERE id = ?').run(auctionId);

  ctx.body = { code: 200, message: '取消收藏成功' };
});

export default router;
