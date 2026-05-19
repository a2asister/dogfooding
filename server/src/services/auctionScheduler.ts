import db from '../db';
import { AuctionStatus, OrderStatus, AuthStatus } from '../types';

export function startAuctionScheduler(): void {
  setInterval(() => {
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE auction_items SET status = ? 
      WHERE status = ? AND startTime <= ? AND auditStatus = ?
    `).run(AuctionStatus.ACTIVE, AuctionStatus.PENDING, now, AuthStatus.VERIFIED);

    const endedAuctions = db.prepare(`
      SELECT * FROM auction_items 
      WHERE status = ? AND endTime <= ?
    `).all(AuctionStatus.ACTIVE, now) as Array<{
      id: number;
      currentPrice: number;
      reservePrice?: number;
      merchantId: number;
      title: string;
    }>;

    for (const auction of endedAuctions) {
      const highestBid = db.prepare(`
        SELECT * FROM bids WHERE auctionId = ? ORDER BY amount DESC LIMIT 1
      `).get(auction.id) as { userId: number; amount: number } | undefined;

      if (highestBid && (!auction.reservePrice || highestBid.amount >= auction.reservePrice)) {
        const merchant = db.prepare(`
          SELECT userId FROM merchants WHERE id = ?
        `).get(auction.merchantId) as { userId: number };

        const config = db.prepare("SELECT value FROM system_configs WHERE key = 'commission_rate'").get() as { value: string };
        const commissionRate = parseFloat(config.value);
        const depositConfig = db.prepare("SELECT value FROM system_configs WHERE key = 'deposit_rate'").get() as { value: string };
        const depositRate = parseFloat(depositConfig.value);
        const payTimeoutConfig = db.prepare("SELECT value FROM system_configs WHERE key = 'pay_timeout'").get() as { value: string };
        const payTimeout = parseInt(payTimeoutConfig.value);

        const orderNo = `ORD${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const payDeadline = new Date(Date.now() + payTimeout * 1000).toISOString();

        db.prepare(`
          INSERT INTO orders (
            orderNo, auctionId, buyerId, sellerId, amount, 
            depositAmount, commissionAmount, status, payDeadline
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderNo, auction.id, highestBid.userId, merchant.userId, highestBid.amount,
          highestBid.amount * depositRate, highestBid.amount * commissionRate,
          OrderStatus.PENDING_PAYMENT, payDeadline
        );

        db.prepare(`
          INSERT INTO messages (userId, type, title, content)
          VALUES (?, 'auction', ?, ?)
        `).run(highestBid.userId, '竞拍成功', `恭喜您成功竞得「${auction.title}」，请在30分钟内完成支付`);

        db.prepare(`
          INSERT INTO messages (userId, type, title, content)
          VALUES (?, 'auction', ?, ?)
        `).run(merchant.userId, '竞拍成功', `您的商品「${auction.title}」已成功拍出`);

        const otherBids = db.prepare(`
          SELECT DISTINCT userId FROM bids WHERE auctionId = ? AND userId != ?
        `).all(auction.id, highestBid.userId) as Array<{ userId: number }>;

        for (const bid of otherBids) {
          db.prepare(`
            UPDATE users SET frozenBalance = frozenBalance - ?, balance = balance + ?
            WHERE id = ?
          `).run(highestBid.amount * depositRate, highestBid.amount * depositRate, bid.userId);

          db.prepare(`
            UPDATE deposit_records SET status = 'released', remark = '竞拍未成功，保证金解冻'
            WHERE userId = ? AND auctionId = ? AND type = 'freeze'
          `).run(bid.userId, auction.id);
        }
      } else {
        const allBids = db.prepare(`
          SELECT DISTINCT userId FROM bids WHERE auctionId = ?
        `).all(auction.id) as Array<{ userId: number }>;

        const depositConfig = db.prepare("SELECT value FROM system_configs WHERE key = 'deposit_rate'").get() as { value: string };
        const depositRate = parseFloat(depositConfig.value);

        for (const bid of allBids) {
          db.prepare(`
            UPDATE users SET frozenBalance = frozenBalance - ?, balance = balance + ?
            WHERE id = ?
          `).run(auction.currentPrice * depositRate, auction.currentPrice * depositRate, bid.userId);

          db.prepare(`
            UPDATE deposit_records SET status = 'released', remark = '商品流拍，保证金解冻'
            WHERE userId = ? AND auctionId = ? AND type = 'freeze'
          `).run(bid.userId, auction.id);
        }

        const merchant = db.prepare(`
          SELECT userId FROM merchants WHERE id = ?
        `).get(auction.merchantId) as { userId: number };

        db.prepare(`
          INSERT INTO messages (userId, type, title, content)
          VALUES (?, 'auction', ?, ?)
        `).run(merchant.userId, '商品流拍', `您的商品「${auction.title}」流拍了`);
      }

      db.prepare(`
        UPDATE auction_items SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
      `).run(AuctionStatus.ENDED, auction.id);
    }

    const expiredOrders = db.prepare(`
      SELECT * FROM orders WHERE status = ? AND payDeadline <= ?
    `).all(OrderStatus.PENDING_PAYMENT, now) as Array<{
      id: number;
      buyerId: number;
      sellerId: number;
      depositAmount: number;
      auctionId: number;
    }>;

    for (const order of expiredOrders) {
      db.prepare(`
        UPDATE users SET frozenBalance = frozenBalance - ? WHERE id = ?
      `).run(order.depositAmount, order.buyerId);

      db.prepare(`
        UPDATE users SET balance = balance + ? WHERE id = ?
      `).run(order.depositAmount * 0.5, order.sellerId);

      db.prepare(`
        UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
      `).run(OrderStatus.CANCELLED, order.id);

      db.prepare(`
        UPDATE deposit_records SET status = 'deducted', remark = '支付超时，扣除50%保证金'
        WHERE userId = ? AND auctionId = ? AND type = 'freeze'
      `).run(order.buyerId, order.auctionId);

      db.prepare(`
        INSERT INTO messages (userId, type, title, content)
        VALUES (?, 'order', ?, ?)
      `).run(order.buyerId, '订单已取消', `您的订单支付超时已取消，扣除违约金 ${(order.depositAmount * 0.5).toFixed(2)} 元`);
    }
  }, 1000);
}
