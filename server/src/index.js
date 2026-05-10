import Fastify from 'fastify';
import cors from '@fastify/cors';
import cron from 'node-cron';
import db from './db.js';

const PORT = 58743;

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: true,
  credentials: true
});

const requestTimestamps = new Map();
const RATE_LIMIT_WINDOW = 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(clientId) {
  const now = Date.now();
  if (!requestTimestamps.has(clientId)) {
    requestTimestamps.set(clientId, []);
  }
  const timestamps = requestTimestamps.get(clientId);
  const windowStart = now - RATE_LIMIT_WINDOW;
  const recentRequests = timestamps.filter(t => t >= windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  timestamps.push(now);
  requestTimestamps.set(clientId, recentRequests);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [clientId, timestamps] of requestTimestamps) {
    const filtered = timestamps.filter(t => t >= now - RATE_LIMIT_WINDOW);
    if (filtered.length === 0) {
      requestTimestamps.delete(clientId);
    } else {
      requestTimestamps.set(clientId, filtered);
    }
  }
}, 5000);

function getCurrentActivity() {
  const now = Date.now();
  return db.prepare(`
    SELECT * FROM activities 
    WHERE end_time > ? 
    ORDER BY start_time ASC 
    LIMIT 1
  `).get(now);
}

function formatActivity(activity) {
  if (!activity) return null;
  const now = Date.now();
  return {
    ...activity,
    status: now < activity.start_time ? 'pending' : (now < activity.end_time ? 'active' : 'ended'),
    timeUntilStart: Math.max(0, activity.start_time - now),
    timeRemaining: Math.max(0, activity.end_time - now)
  };
}

fastify.get('/api/activity', (req, reply) => {
  const activity = getCurrentActivity();
  reply.send({
    success: true,
    data: formatActivity(activity)
  });
});

fastify.get('/api/activities', (req, reply) => {
  const activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all();
  reply.send({
    success: true,
    data: activities.map(formatActivity)
  });
});

fastify.post('/api/activity', (req, reply) => {
  const {
    name,
    product_name,
    product_image,
    original_price,
    sale_price,
    start_time,
    end_time,
    total_stock
  } = req.body;

  if (!name || !product_name || !original_price || !sale_price || !start_time || !end_time || !total_stock) {
    return reply.code(400).send({
      success: false,
      message: '缺少必要参数'
    });
  }

  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO activities (
      name, product_name, product_image, original_price, sale_price,
      start_time, end_time, total_stock, current_stock, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, product_name, product_image || null,
    original_price, sale_price,
    start_time, end_time,
    total_stock, total_stock,
    now
  );

  reply.send({
    success: true,
    data: { id: result.lastInsertRowid }
  });
});

fastify.put('/api/activity/:id', (req, reply) => {
  const { id } = req.params;
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
  
  if (!activity) {
    return reply.code(404).send({
      success: false,
      message: '活动不存在'
    });
  }

  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(req.body)) {
    if (['name', 'product_name', 'product_image', 'original_price', 'sale_price', 'start_time', 'end_time', 'total_stock'].includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE activities SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  reply.send({ success: true });
});

fastify.delete('/api/activity/:id', (req, reply) => {
  const { id } = req.params;
  db.prepare('DELETE FROM orders WHERE activity_id = ?').run(id);
  db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  reply.send({ success: true });
});

const lock = new Map();

fastify.post('/api/purchase', async (req, reply) => {
  const { activity_id, user_id, slider_token } = req.body;
  
  const clientId = user_id || req.ip;
  
  if (!checkRateLimit(clientId)) {
    return reply.code(429).send({
      success: false,
      message: '请求过于频繁，请稍后再试'
    });
  }

  if (!activity_id || !user_id || !slider_token) {
    return reply.code(400).send({
      success: false,
      message: '缺少必要参数'
    });
  }

  const now = Date.now();
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(activity_id);
  
  if (!activity) {
    return reply.code(404).send({
      success: false,
      message: '活动不存在'
    });
  }

  if (now < activity.start_time) {
    return reply.code(400).send({
      success: false,
      message: '活动尚未开始'
    });
  }

  if (now >= activity.end_time) {
    return reply.code(400).send({
      success: false,
      message: '活动已结束'
    });
  }

  const existingOrder = db.prepare('SELECT * FROM orders WHERE user_id = ? AND activity_id = ?').get(user_id, activity_id);
  if (existingOrder) {
    return reply.code(400).send({
      success: false,
      message: '您已抢购过此商品'
    });
  }

  const lockKey = `purchase_${activity_id}`;
  if (lock.get(lockKey)) {
    return reply.code(400).send({
      success: false,
      message: '系统繁忙，请稍后再试'
    });
  }

  lock.set(lockKey, true);

  try {
    const currentActivity = db.prepare('SELECT current_stock FROM activities WHERE id = ?').get(activity_id);
    
    if (!currentActivity || currentActivity.current_stock <= 0) {
      return reply.code(400).send({
        success: false,
        message: '商品已售罄'
      });
    }

    const updateResult = db.prepare('UPDATE activities SET current_stock = current_stock - 1 WHERE id = ? AND current_stock > 0').run(activity_id);
    
    if (updateResult.changes === 0) {
      return reply.code(400).send({
        success: false,
        message: '商品已售罄'
      });
    }

    db.prepare('INSERT INTO orders (activity_id, user_id, created_at) VALUES (?, ?, ?)').run(activity_id, user_id, now);

    const updatedActivity = db.prepare('SELECT * FROM activities WHERE id = ?').get(activity_id);

    reply.send({
      success: true,
      message: '抢购成功！',
      data: {
        remaining: updatedActivity.current_stock
      }
    });
  } finally {
    lock.set(lockKey, false);
  }
});

cron.schedule('* * * * *', () => {
  const now = Date.now();
  const activities = db.prepare('SELECT * FROM activities WHERE end_time > ?').all(now);
  
  for (const activity of activities) {
    const elapsed = now - activity.start_time;
    const totalDuration = activity.end_time - activity.start_time;
    
    if (elapsed > 0 && totalDuration > 0) {
      const progress = Math.min(elapsed / totalDuration, 0.95);
      const simulatedSold = Math.floor(activity.total_stock * progress);
      const newStock = Math.max(0, activity.total_stock - simulatedSold);
      
      db.prepare('UPDATE activities SET current_stock = ? WHERE id = ?').run(newStock, activity.id);
    }
  }
  
  console.log('[定时任务] 库存状态已同步');
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`闪购服务已启动，端口: ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
