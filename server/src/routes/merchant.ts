import Router from 'koa-router';
import { z } from 'zod';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import { UserRole, AuctionStatus, AuthStatus } from '../types';

const router = new Router({ prefix: '/api/merchant' });

const merchantAuthSchema = z.object({
  companyName: z.string().min(2, '公司名称至少2位'),
  businessLicense: z.string().min(5, '营业执照号格式不正确'),
  contactName: z.string().min(2, '联系人姓名至少2位'),
  contactPhone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
});

const auctionItemSchema = z.object({
  title: z.string().min(5, '标题至少5位'),
  description: z.string().min(10, '描述至少10位'),
  images: z.string().min(1, '请上传商品图片'),
  category: z.string().min(1, '请选择分类'),
  startPrice: z.number().min(0.01, '起拍价必须大于0'),
  minIncrement: z.number().min(1, '加价幅度至少1元'),
  reservePrice: z.number().optional(),
  startTime: z.string().min(1, '请选择开始时间'),
  endTime: z.string().min(1, '请选择结束时间')
});

router.post('/auth', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const body = merchantAuthSchema.safeParse(ctx.request.body);

  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const existing = db.prepare('SELECT id FROM merchants WHERE userId = ?').get(userId);
  
  if (existing) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '已提交过资质认证' };
    return;
  }

  const { companyName, businessLicense, contactName, contactPhone } = body.data;
  
  db.prepare(`
    INSERT INTO merchants (userId, companyName, businessLicense, contactName, contactPhone)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, companyName, businessLicense, contactName, contactPhone);

  ctx.body = { code: 200, message: '资质认证提交成功，等待审核' };
});

router.get('/auth/status', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  
  const merchant = db.prepare('SELECT * FROM merchants WHERE userId = ?').get(userId);
  
  ctx.body = { code: 200, data: merchant || null };
});

router.get('/auctions', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20, status } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const merchant = db.prepare('SELECT id FROM merchants WHERE userId = ?').get(userId) as { id: number };
  
  if (!merchant) {
    ctx.body = { code: 200, data: { items: [], total: 0 } };
    return;
  }

  let whereClause = 'WHERE merchantId = ?';
  const params: unknown[] = [merchant.id];

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  const items = db.prepare(`
    SELECT * FROM auction_items ${whereClause}
    ORDER BY createdAt DESC LIMIT ? OFFSET ?
  `).all(...params, Number(pageSize), offset);

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM auction_items ${whereClause}
  `).get(...params) as { count: number };

  ctx.body = { code: 200, data: { items, total: total.count } };
});

router.post('/auction', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const body = auctionItemSchema.safeParse(ctx.request.body);

  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const merchant = db.prepare('SELECT id, authStatus FROM merchants WHERE userId = ?').get(userId) as { id: number; authStatus: string };
  
  if (!merchant) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '请先完成商家资质认证' };
    return;
  }

  if (merchant.authStatus !== AuthStatus.VERIFIED) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '商家资质认证未通过' };
    return;
  }

  const { title, description, images, category, startPrice, minIncrement, reservePrice, startTime, endTime } = body.data;

  db.prepare(`
    INSERT INTO auction_items (
      merchantId, title, description, images, category, 
      startPrice, currentPrice, minIncrement, reservePrice, 
      startTime, endTime, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    merchant.id, title, description, images, category,
    startPrice, startPrice, minIncrement, reservePrice,
    startTime, endTime, AuctionStatus.PENDING
  );

  ctx.body = { code: 200, message: '商品发布成功，等待平台审核' };
});

router.put('/auction/:id', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const auctionId = Number(ctx.params.id);
  const body = auctionItemSchema.safeParse(ctx.request.body);

  if (!body.success) {
    ctx.status = 400;
    ctx.body = { code: 400, message: body.error.issues[0]?.message || '参数错误' };
    return;
  }

  const merchant = db.prepare('SELECT id FROM merchants WHERE userId = ?').get(userId) as { id: number };
  
  const auction = db.prepare('SELECT merchantId, status FROM auction_items WHERE id = ?').get(auctionId) as { merchantId: number; status: string };
  
  if (!auction || auction.merchantId !== merchant.id) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '拍卖商品不存在' };
    return;
  }

  if (auction.status !== AuctionStatus.DRAFT && auction.status !== AuctionStatus.PENDING) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '该状态下无法修改' };
    return;
  }

  const { title, description, images, category, startPrice, minIncrement, reservePrice, startTime, endTime } = body.data;

  db.prepare(`
    UPDATE auction_items SET 
      title = ?, description = ?, images = ?, category = ?,
      startPrice = ?, currentPrice = ?, minIncrement = ?, reservePrice = ?,
      startTime = ?, endTime = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title, description, images, category,
    startPrice, startPrice, minIncrement, reservePrice,
    startTime, endTime, auctionId
  );

  ctx.body = { code: 200, message: '修改成功' };
});

router.delete('/auction/:id', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const auctionId = Number(ctx.params.id);

  const merchant = db.prepare('SELECT id FROM merchants WHERE userId = ?').get(userId) as { id: number };
  const auction = db.prepare('SELECT merchantId, status FROM auction_items WHERE id = ?').get(auctionId) as { merchantId: number; status: string };
  
  if (!auction || auction.merchantId !== merchant.id) {
    ctx.status = 404;
    ctx.body = { code: 404, message: '拍卖商品不存在' };
    return;
  }

  if (auction.status === AuctionStatus.ACTIVE) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '拍卖进行中无法删除' };
    return;
  }

  db.prepare('UPDATE auction_items SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(AuctionStatus.CANCELLED, auctionId);

  ctx.body = { code: 200, message: '删除成功' };
});

router.get('/orders', authMiddleware([UserRole.MERCHANT]), async (ctx) => {
  const { userId } = ctx.state.user;
  const { page = 1, pageSize = 20 } = ctx.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const orders = db.prepare(`
    SELECT o.*, a.title as auctionTitle, u.nickname as buyerName
    FROM orders o
    INNER JOIN auction_items a ON o.auctionId = a.id
    INNER JOIN users u ON o.buyerId = u.id
    WHERE o.sellerId = ?
    ORDER BY o.createdAt DESC LIMIT ? OFFSET ?
  `).all(userId, Number(pageSize), offset);

  const total = db.prepare('SELECT COUNT(*) as count FROM orders WHERE sellerId = ?').get(userId) as { count: number };

  ctx.body = { code: 200, data: { orders, total: total.count } };
});

export default router;
