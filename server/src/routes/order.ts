import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { UserRole, OrderStatus, AuctionStatus } from '../types';

const router = new Router({ prefix: '/api/order' });

router.get('/list', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20, status, role = 'buyer' } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  let whereClause = role === 'buyer' ? 'WHERE buyerId = ?' : 'WHERE sellerId = ?';
  const params: unknown[] = [userId];

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  const orders = db.prepare(`
    SELECT o.*, a.title as auctionTitle, a.images as auctionImages,
           u.nickname as ${role === 'buyer' ? 'sellerName' : 'buyerName'}
    FROM orders o
    INNER JOIN auction_items a ON o.auctionId = a.id
    INNER JOIN users u ON o.${role === 'buyer' ? 'sellerId' : 'buyerId'} = u.id
    ${whereClause} ORDER BY o.createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders ${whereClause}`).get(...params) as { count: number };

  ctx.body = { code: 200, data: { orders, total: total.count } };
});

router.get('/:id', authMiddleware(), async (ctx) => {
  const { userId } = ctx.state.user;
  const orderId = Number(ctx.params.id);

  const order = db.prepare(`
    SELECT o.*, a.title as auctionTitle, a.description as auctionDescription, a.images as auctionImages,
           buyer.nickname as buyerName, buyer.phone as buyerPhone,
           seller.nickname as sellerName, seller.phone as sellerPhone
    FROM orders o
    INNER JOIN auction_items a ON o.auctionId = a.id
    INNER JOIN users buyer ON o.buyerId = buyer.id
    INNER JOIN users seller ON o.sellerId = seller.id
    WHERE o.id = ? AND (o.buyerId = ? OR o.sellerId = ?)
  `).get(orderId, userId, userId);

  if (!order) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '订单不存在' };
    return;
  }

  ctx.body = { code: 200, data: order };
});

router.post('/:id/pay', authMiddleware([UserRole.USER]), async (ctx) => {
  const { userId } = ctx.state.user;
  const orderId = Number(ctx.params.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyerId = ?').get(orderId, userId) as {
    id: number;
    amount: number;
    depositAmount: number;
    status: string;
    sellerId: number;
    auctionId: number;
  } | undefined;

  if (!order) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '订单不存在' };
    return;
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '订单状态不正确' };
    return;
  }

  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
  const remainingAmount = order.amount - order.depositAmount;

  if (user.balance < remainingAmount) {
    ctx.status = 400;
    ctx.body = { code: 400, message: `余额不足，还需支付 ${remainingAmount.toFixed(2)} 元` };
    return;
  }

  const config = db.prepare("SELECT value FROM system_configs WHERE key = 'commission_rate'").get() as { value: string };
  const commissionRate = parseFloat(config.value);
  const commissionAmount = order.amount * commissionRate;

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE users SET balance = balance - ?, frozenBalance = frozenBalance - ?
      WHERE id = ?
    `).run(remainingAmount, order.depositAmount, userId);

    db.prepare(`
      UPDATE users SET balance = balance + ? WHERE id = ?
    `).run(order.amount - commissionAmount, order.sellerId);

    db.prepare(`
      UPDATE orders SET status = ?, paidAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(OrderStatus.PAID, orderId);

    db.prepare(`
      UPDATE deposit_records SET status = 'released', remark = '冲抵货款'
      WHERE userId = ? AND auctionId = ? AND type = 'freeze'
    `).run(userId, order.auctionId);

    db.prepare(`
      INSERT INTO messages (userId, type, title, content)
      VALUES (?, 'order', ?, ?)
    `).run(userId, '订单支付成功', `您已成功支付订单，金额：${order.amount.toFixed(2)} 元`);

    db.prepare(`
      INSERT INTO messages (userId, type, title, content)
      VALUES (?, 'order', ?, ?)
    `).run(order.sellerId, 'order', '商品已售出', `您的商品已被购买，金额：${(order.amount - commissionAmount).toFixed(2)} 元`);
  });

  tx();

  ctx.body = { code: 200, message: '支付成功' };
});

router.post('/:id/confirm', authMiddleware([UserRole.USER]), async (ctx) => {
  const { userId } = ctx.state.user;
  const orderId = Number(ctx.params.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyerId = ?').get(orderId, userId) as {
    id: number;
    status: string;
  } | undefined;

  if (!order) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '订单不存在' };
    return;
  }

  if (order.status !== OrderStatus.SHIPPED) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '订单状态不正确' };
    return;
  }

  db.prepare(`
    UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
  `).run(OrderStatus.COMPLETED, orderId);

  ctx.body = { code: 200, message: '确认收货成功' };
});

router.post('/:id/cancel', authMiddleware([UserRole.USER]), async (ctx) => {
  const { userId } = ctx.state.user;
  const orderId = Number(ctx.params.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyerId = ?').get(orderId, userId) as {
    id: number;
    status: string;
    depositAmount: number;
    sellerId: number;
    auctionId: number;
  } | undefined;

  if (!order) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '订单不存在' };
    return;
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '该状态下无法取消订单' };
    return;
  }

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE users SET frozenBalance = frozenBalance - ?, balance = balance + ?
      WHERE id = ?
    `).run(order.depositAmount, order.depositAmount * 0.5, userId);

    db.prepare(`
      UPDATE users SET balance = balance + ? WHERE id = ?
    `).run(order.depositAmount * 0.5, order.sellerId);

    db.prepare(`
      UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `).run(OrderStatus.CANCELLED, orderId);

    db.prepare(`
      UPDATE deposit_records SET status = 'deducted', remark = '违约扣除50%保证金'
      WHERE userId = ? AND auctionId = ? AND type = 'freeze'
    `).run(userId, order.auctionId);

    db.prepare(`
      INSERT INTO messages (userId, type, title, content)
      VALUES (?, 'order', ?, ?)
    `).run(userId, '订单已取消', `您已取消订单，扣除违约金 ${(order.depositAmount * 0.5).toFixed(2)} 元`);
  });

  tx();

  ctx.body = { code: 200, message: '订单已取消，违约金已扣除' };
});

export default router;
