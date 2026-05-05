const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isBefore, isAfter, format, differenceInSeconds } = require('date-fns');

const app = express();
const PORT = 3003;

const DATA_DIR = path.join(__dirname, '../../data');
const FLASH_SALE_FILE = path.join(DATA_DIR, 'flash-sales.json');
const ORDERS_FILE = path.join(DATA_DIR, 'flash-sale-orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultFlashSales = [
  {
    id: uuidv4(),
    name: 'iPhone 15 Pro Max 限时秒杀',
    productId: 'prod_001',
    productName: 'iPhone 15 Pro Max 256GB',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone%20product%20photo&image_size=square',
    originalPrice: 9999,
    flashPrice: 5999,
    totalStock: 100,
    soldStock: 45,
    limitPerUser: 1,
    status: 'active',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: '年度旗舰，钛金属边框，A17 Pro芯片',
    category: '手机数码',
    sortOrder: 1,
    isHot: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'MacBook Air M3 冰点价',
    productId: 'prod_002',
    productName: 'MacBook Air 15英寸 M3芯片',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Air%20laptop%20computer%20product%20photo&image_size=square',
    originalPrice: 10999,
    flashPrice: 7999,
    totalStock: 50,
    soldStock: 32,
    limitPerUser: 1,
    status: 'active',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: '轻薄便携，超长续航，M3芯片性能强劲',
    category: '电脑办公',
    sortOrder: 2,
    isHot: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'AirPods Pro 2 五折抢',
    productId: 'prod_003',
    productName: 'AirPods Pro 2 降噪耳机',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AirPods%20Pro%20wireless%20earbuds%20product%20photo&image_size=square',
    originalPrice: 1899,
    flashPrice: 899,
    totalStock: 200,
    soldStock: 187,
    limitPerUser: 2,
    status: 'active',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: '主动降噪，空间音频，H2芯片',
    category: '手机数码',
    sortOrder: 3,
    isHot: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '即将开场：Sony WH-1000XM5',
    productId: 'prod_004',
    productName: 'Sony WH-1000XM5 头戴式降噪耳机',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sony%20WH-1000XM5%20headphones%20product%20photo&image_size=square',
    originalPrice: 2999,
    flashPrice: 1499,
    totalStock: 100,
    soldStock: 0,
    limitPerUser: 1,
    status: 'scheduled',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    description: '业界顶级降噪，30小时续航',
    category: '手机数码',
    sortOrder: 4,
    isHot: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

if (!fs.existsSync(FLASH_SALE_FILE)) {
  fs.writeFileSync(FLASH_SALE_FILE, JSON.stringify(defaultFlashSales, null, 2));
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

app.use(cors());
app.use(express.json());

const logServiceUrl = 'http://localhost:3001/api/logs';

const log = async (level, message, metadata = {}) => {
  try {
    await fetch(logServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'flash-sale-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readFlashSales = () => {
  try {
    const data = fs.readFileSync(FLASH_SALE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultFlashSales;
  }
};

const writeFlashSales = (items) => {
  fs.writeFileSync(FLASH_SALE_FILE, JSON.stringify(items, null, 2));
};

const readOrders = () => {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeOrders = (orders) => {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

const calculateStatus = (item) => {
  const now = new Date();
  const start = new Date(item.startTime);
  const end = new Date(item.endTime);

  if (isBefore(now, start)) return 'scheduled';
  if (isAfter(now, end)) return 'ended';
  if (item.soldStock >= item.totalStock) return 'sold_out';
  return 'active';
};

const getCountdown = (item) => {
  const now = new Date();
  const start = new Date(item.startTime);
  const end = new Date(item.endTime);
  const status = calculateStatus(item);

  if (status === 'scheduled') {
    return {
      type: 'upcoming',
      seconds: differenceInSeconds(start, now)
    };
  } else if (status === 'active') {
    return {
      type: 'active',
      seconds: differenceInSeconds(end, now)
    };
  }
  return {
    type: 'ended',
    seconds: 0
  };
};

app.get('/api/flash-sales', (req, res) => {
  try {
    const { status, category, keyword, limit = 20, offset = 0 } = req.query;
    let items = readFlashSales();

    items = items.map(item => ({
      ...item,
      status: calculateStatus(item),
      countdown: getCountdown(item),
      availableStock: item.totalStock - item.soldStock,
      discountPercent: Math.round((1 - item.flashPrice / item.originalPrice) * 100),
      formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
    }));

    if (status) {
      items = items.filter(item => item.status === status);
    }

    if (category) {
      items = items.filter(item => item.category === category);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(kw) || 
        item.productName.toLowerCase().includes(kw)
      );
    }

    items.sort((a, b) => {
      const statusOrder = { active: 0, scheduled: 1, sold_out: 2, ended: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.sortOrder - b.sortOrder;
    });

    const total = items.length;
    const paginated = items.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取秒杀列表成功', { count: paginated.length });

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取秒杀列表失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/flash-sales/active', (req, res) => {
  try {
    let items = readFlashSales();

    items = items
      .map(item => ({
        ...item,
        status: calculateStatus(item),
        countdown: getCountdown(item),
        availableStock: item.totalStock - item.soldStock,
        discountPercent: Math.round((1 - item.flashPrice / item.originalPrice) * 100),
        formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
        formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
      }))
      .filter(item => item.status === 'active' || item.status === 'scheduled')
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        return a.sortOrder - b.sortOrder;
      });

    const hotItems = items.filter(item => item.isHot);
    const normalItems = items.filter(item => !item.isHot);

    log('info', '获取当前活跃秒杀', { hot: hotItems.length, normal: normalItems.length });

    res.json({
      success: true,
      data: {
        hot: hotItems,
        all: items
      }
    });
  } catch (error) {
    log('error', '获取活跃秒杀失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/flash-sales/:id', (req, res) => {
  try {
    const { id } = req.params;
    const items = readFlashSales();
    const item = items.find(i => i.id === id);

    if (!item) {
      log('warn', '秒杀商品不存在', { id });
      return res.status(404).json({ error: 'Flash sale not found' });
    }

    const enrichedItem = {
      ...item,
      status: calculateStatus(item),
      countdown: getCountdown(item),
      availableStock: item.totalStock - item.soldStock,
      discountPercent: Math.round((1 - item.flashPrice / item.originalPrice) * 100),
      formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
    };

    log('info', '获取秒杀详情成功', { id, name: item.name });
    res.json({ success: true, data: enrichedItem });
  } catch (error) {
    log('error', '获取秒杀详情失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/flash-sales/:id/purchase', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const items = readFlashSales();
    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      log('warn', '秒杀商品不存在', { id });
      return res.status(404).json({ error: 'Flash sale not found' });
    }

    const item = items[itemIndex];
    const status = calculateStatus(item);

    if (status === 'scheduled') {
      return res.status(400).json({ error: 'Flash sale has not started yet' });
    }

    if (status === 'ended') {
      return res.status(400).json({ error: 'Flash sale has ended' });
    }

    if (status === 'sold_out') {
      return res.status(400).json({ error: 'Flash sale is sold out' });
    }

    const availableStock = item.totalStock - item.soldStock;
    if (quantity > availableStock) {
      return res.status(400).json({ 
        error: 'Insufficient stock', 
        available: availableStock 
      });
    }

    if (quantity > item.limitPerUser) {
      return res.status(400).json({ 
        error: 'Exceeds purchase limit', 
        limit: item.limitPerUser 
      });
    }

    const orders = readOrders();
    const userPurchased = orders
      .filter(o => o.flashSaleId === id && o.userId === userId && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.quantity, 0);

    if (userPurchased + quantity > item.limitPerUser) {
      return res.status(400).json({ 
        error: 'You have reached the purchase limit',
        alreadyPurchased: userPurchased,
        limit: item.limitPerUser
      });
    }

    items[itemIndex].soldStock += quantity;
    items[itemIndex].updatedAt = new Date().toISOString();
    writeFlashSales(items);

    const order = {
      id: uuidv4(),
      flashSaleId: id,
      userId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      originalPrice: item.originalPrice,
      flashPrice: item.flashPrice,
      quantity,
      totalAmount: item.flashPrice * quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(order);
    writeOrders(orders);

    log('info', '秒杀下单成功', { 
      orderId: order.id, 
      flashSaleId: id,
      userId,
      quantity 
    });

    res.status(201).json({ 
      success: true, 
      data: order,
      message: 'Purchase successful'
    });
  } catch (error) {
    log('error', '秒杀下单失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/flash-sales', (req, res) => {
  try {
    const { 
      name, 
      productId, 
      productName, 
      productImage,
      originalPrice, 
      flashPrice, 
      totalStock,
      limitPerUser,
      startTime,
      endTime,
      description,
      category,
      sortOrder,
      isHot
    } = req.body;

    if (!name || !productId || !originalPrice || !flashPrice || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const items = readFlashSales();
    const newItem = {
      id: uuidv4(),
      name,
      productId,
      productName: productName || name,
      productImage: productImage || '',
      originalPrice: parseFloat(originalPrice),
      flashPrice: parseFloat(flashPrice),
      totalStock: parseInt(totalStock) || 0,
      soldStock: 0,
      limitPerUser: parseInt(limitPerUser) || 1,
      status: 'draft',
      startTime,
      endTime,
      description: description || '',
      category: category || '未分类',
      sortOrder: parseInt(sortOrder) || items.length + 1,
      isHot: isHot || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.push(newItem);
    writeFlashSales(items);

    log('info', '创建秒杀活动成功', { id: newItem.id, name: newItem.name });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    log('error', '创建秒杀活动失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/flash-sales/orders/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const orders = readOrders()
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = orders.length;
    const paginated = orders.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取用户秒杀订单', { userId, count: paginated.length });

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取用户订单失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`秒杀服务运行在 http://localhost:${PORT}`);
});
