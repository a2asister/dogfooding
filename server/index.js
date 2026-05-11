import Fastify from 'fastify';
import cors from '@fastify/cors';
import db from './database.js';

const fastify = Fastify({
  logger: true
});

await fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.post('/api/login', async (request, reply) => {
  const { phone } = request.body;
  
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return reply.status(400).send({ error: '无效的手机号' });
  }

  try {
    const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    let user;
    
    if (existing) {
      user = existing;
    } else {
      const result = db.prepare('INSERT INTO users (phone) VALUES (?)').run(phone);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const existingDraw = db.prepare(`
      SELECT uc.*, cb.name as batch_name 
      FROM user_coupons uc 
      LEFT JOIN coupon_batches cb ON uc.batch_id = cb.id 
      WHERE uc.user_id = ?
    `).get(user.id);

    return reply.send({ user, hasDrawn: !!existingDraw, coupon: existingDraw });
  } catch (error) {
    return reply.status(500).send({ error: '登录失败' });
  }
});

fastify.get('/api/batches', async (request, reply) => {
  try {
    const batches = db.prepare('SELECT * FROM coupon_batches').all();
    return reply.send(batches);
  } catch (error) {
    return reply.status(500).send({ error: '获取批次失败' });
  }
});

fastify.post('/api/batches', async (request, reply) => {
  const { name, amount, total_count, win_probability } = request.body;
  
  if (!name || !amount || !total_count || win_probability === undefined) {
    return reply.status(400).send({ error: '缺少必要参数' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO coupon_batches (name, amount, total_count, win_probability) 
      VALUES (?, ?, ?, ?)
    `).run(name, amount, total_count, win_probability);
    
    const batch = db.prepare('SELECT * FROM coupon_batches WHERE id = ?').get(result.lastInsertRowid);
    return reply.send(batch);
  } catch (error) {
    return reply.status(500).send({ error: '创建批次失败' });
  }
});

fastify.put('/api/batches/:id', async (request, reply) => {
  const { id } = request.params;
  const { name, amount, total_count, win_probability } = request.body;

  try {
    const existing = db.prepare('SELECT * FROM coupon_batches WHERE id = ?').get(id);
    if (!existing) {
      return reply.status(404).send({ error: '批次不存在' });
    }

    db.prepare(`
      UPDATE coupon_batches 
      SET name = COALESCE(?, name),
          amount = COALESCE(?, amount),
          total_count = COALESCE(?, total_count),
          win_probability = COALESCE(?, win_probability)
      WHERE id = ?
    `).run(name, amount, total_count, win_probability, id);

    const updated = db.prepare('SELECT * FROM coupon_batches WHERE id = ?').get(id);
    return reply.send(updated);
  } catch (error) {
    return reply.status(500).send({ error: '更新批次失败' });
  }
});

fastify.delete('/api/batches/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    const result = db.prepare('DELETE FROM coupon_batches WHERE id = ?').run(id);
    if (result.changes === 0) {
      return reply.status(404).send({ error: '批次不存在' });
    }
    return reply.send({ success: true });
  } catch (error) {
    return reply.status(500).send({ error: '删除批次失败' });
  }
});

fastify.post('/api/draw', async (request, reply) => {
  const { userId, phone } = request.body;

  if (!userId || !phone) {
    return reply.status(400).send({ error: '缺少必要参数' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND phone = ?').get(userId, phone);
    if (!user) {
      return reply.status(400).send({ error: '用户不存在' });
    }

    const existingDrawByUserId = db.prepare('SELECT * FROM user_coupons WHERE user_id = ?').get(userId);
    if (existingDrawByUserId) {
      return reply.status(400).send({ error: '您已经刮过一次了' });
    }

    const existingDrawByPhone = db.prepare(`
      SELECT uc.* FROM user_coupons uc 
      JOIN users u ON uc.user_id = u.id 
      WHERE u.phone = ?
    `).get(phone);
    if (existingDrawByPhone) {
      return reply.status(400).send({ error: '该手机号已经刮过一次了' });
    }

    const drawCount = db.prepare('SELECT COUNT(*) as count FROM user_coupons WHERE user_id = ?').get(userId).count;
    if (drawCount > 0) {
      return reply.status(400).send({ error: '您已经刮过一次了' });
    }

    const availableBatches = db.prepare(`
      SELECT * FROM coupon_batches 
      WHERE used_count < total_count 
      AND win_probability > 0
    `).all();

    let isWinner = false;
    let selectedBatch = null;

    if (availableBatches.length > 0) {
      const totalProbability = availableBatches.reduce((sum, b) => sum + b.win_probability, 0);
      const random = Math.random();
      
      if (random < totalProbability) {
        let cumulative = 0;
        for (const batch of availableBatches) {
          cumulative += batch.win_probability;
          if (random < cumulative) {
            selectedBatch = batch;
            isWinner = true;
            break;
          }
        }
      }
    }

    if (isWinner && selectedBatch) {
      const updateResult = db.prepare(`
        UPDATE coupon_batches 
        SET used_count = used_count + 1 
        WHERE id = ? AND used_count < total_count
      `).run(selectedBatch.id);
      
      if (updateResult.changes === 0) {
        return reply.status(400).send({ error: '该优惠券已领完，请稍后再试' });
      }
      
      const insertResult = db.prepare(`
        INSERT INTO user_coupons (user_id, batch_id, amount, is_winner) 
        VALUES (?, ?, ?, 1)
      `).run(userId, selectedBatch.id, selectedBatch.amount);

      const coupon = db.prepare(`
        SELECT uc.*, cb.name as batch_name, cb.amount as amount
        FROM user_coupons uc 
        JOIN coupon_batches cb ON uc.batch_id = cb.id 
        WHERE uc.id = ?
      `).get(insertResult.lastInsertRowid);

      return reply.send({ isWinner: true, coupon });
    } else {
      db.prepare('INSERT INTO user_coupons (user_id, is_winner) VALUES (?, 0)').run(userId);
      return reply.send({ isWinner: false, coupon: null });
    }
  } catch (error) {
    console.error('Draw error:', error);
    return reply.status(500).send({ error: '抽奖失败，请稍后重试' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('服务器运行在 http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
