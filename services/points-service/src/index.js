const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format, addDays } = require('date-fns');

const app = express();
const PORT = 3007;

const DATA_DIR = path.join(__dirname, '../../data');
const POINTS_BALANCE_FILE = path.join(DATA_DIR, 'points-balances.json');
const POINTS_TRANSACTIONS_FILE = path.join(DATA_DIR, 'points-transactions.json');
const POINTS_PRODUCTS_FILE = path.join(DATA_DIR, 'points-products.json');
const POINTS_ORDERS_FILE = path.join(DATA_DIR, 'points-orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultBalances = [
  {
    id: uuidv4(),
    userId: 'user_001',
    totalPoints: 5680,
    availablePoints: 5680,
    frozenPoints: 0,
    usedPoints: 0,
    level: 'gold',
    levelName: '黄金会员',
    nextLevelPoints: 10000,
    updatedAt: new Date().toISOString()
  }
];

const defaultTransactions = [
  {
    id: uuidv4(),
    userId: 'user_001',
    type: 'earn',
    subtype: 'consumption',
    points: 100,
    beforeBalance: 5580,
    afterBalance: 5680,
    description: '消费获取积分',
    relatedOrderId: 'order_001',
    source: 'order-service',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    userId: 'user_001',
    type: 'earn',
    subtype: 'sign_in',
    points: 10,
    beforeBalance: 5570,
    afterBalance: 5580,
    description: '每日签到',
    source: 'points-service',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    userId: 'user_001',
    type: 'spend',
    subtype: 'exchange',
    points: -500,
    beforeBalance: 6070,
    afterBalance: 5570,
    description: '积分兑换优惠券',
    relatedOrderId: 'points_order_001',
    source: 'points-service',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const defaultProducts = [
  {
    id: uuidv4(),
    name: '满100减20优惠券',
    type: 'coupon',
    description: '全场通用满100减20',
    pointsPrice: 500,
    originalPrice: 20,
    stock: 500,
    soldCount: 120,
    status: 'active',
    category: '优惠券',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=discount%20coupon%20card%20with%20golden%20border%20on%20dark%20blue%20background&image_size=square',
    exchangeLimit: 3,
    expiryDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '免邮券',
    type: 'shipping_coupon',
    description: '全场免邮券',
    pointsPrice: 200,
    originalPrice: 10,
    stock: 1000,
    soldCount: 89,
    status: 'active',
    category: '优惠券',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shipping%20coupon%20card%20free%20delivery%20icon&image_size=square',
    exchangeLimit: 5,
    expiryDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'iPhone 15 Pro 1000元抵扣券',
    type: 'product_coupon',
    description: '购买iPhone 15 Pro系列可抵扣1000元',
    pointsPrice: 5000,
    originalPrice: 1000,
    stock: 50,
    soldCount: 0,
    status: 'active',
    category: '大额券',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20golden%20coupon%20card%20luxury%20discount&image_size=square',
    exchangeLimit: 1,
    expiryDays: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '会员日双倍积分卡',
    type: 'double_points',
    description: '使用后当月所有消费积分翻倍',
    pointsPrice: 300,
    originalPrice: 0,
    stock: 200,
    soldCount: 0,
    status: 'active',
    category: '权益卡',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20points%20card%20golden%20star%20icon&image_size=square',
    exchangeLimit: 2,
    expiryDays: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

if (!fs.existsSync(POINTS_BALANCE_FILE)) {
  fs.writeFileSync(POINTS_BALANCE_FILE, JSON.stringify(defaultBalances, null, 2));
}

if (!fs.existsSync(POINTS_TRANSACTIONS_FILE)) {
  fs.writeFileSync(POINTS_TRANSACTIONS_FILE, JSON.stringify(defaultTransactions, null, 2));
}

if (!fs.existsSync(POINTS_PRODUCTS_FILE)) {
  fs.writeFileSync(POINTS_PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
}

if (!fs.existsSync(POINTS_ORDERS_FILE)) {
  fs.writeFileSync(POINTS_ORDERS_FILE, JSON.stringify([], null, 2));
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
        service: 'points-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readData = (file, defaultData) => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultData;
  }
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

app.get('/api/balances/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const balances = readData(POINTS_BALANCE_FILE, defaultBalances);
    const balance = balances.find(b => b.userId === userId);

    if (!balance) {
      const newBalance = {
        id: uuidv4(),
        userId,
        totalPoints: 0,
        availablePoints: 0,
        frozenPoints: 0,
        usedPoints: 0,
        level: 'new',
        levelName: '新会员',
        nextLevelPoints: 1000,
        updatedAt: new Date().toISOString()
      };
      balances.push(newBalance);
      writeData(POINTS_BALANCE_FILE, balances);
      log('info', '创建新用户积分账户', { userId });
      return res.json({ success: true, data: newBalance });
    }

    const levels = [
      { min: 0, max: 1000, level: 'new', name: '新会员', next: 1000 },
      { min: 1000, max: 5000, level: 'bronze', name: '青铜会员', next: 5000 },
      { min: 5000, max: 10000, level: 'silver', name: '白银会员', next: 10000 },
      { min: 10000, max: 50000, level: 'gold', name: '黄金会员', next: 50000 },
      { min: 50000, max: Infinity, level: 'platinum', name: '铂金会员', next: null }
    ];

    const userLevel = levels.find(l => balance.totalPoints >= l.min && balance.totalPoints < l.max) || levels[levels.length - 1];
    balance.level = userLevel.level;
    balance.levelName = userLevel.name;
    balance.nextLevelPoints = userLevel.next;

    log('info', '获取用户积分余额', { userId, points: balance.availablePoints });
    res.json({ success: true, data: balance });
  } catch (error) {
    log('error', '获取积分余额失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/balances/:userId/earn', (req, res) => {
  try {
    const { userId } = req.params;
    const { points, type = 'consumption', description, relatedOrderId, source = 'api' } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Invalid points amount' });
    }

    const balances = readData(POINTS_BALANCE_FILE, defaultBalances);
    let balance = balances.find(b => b.userId === userId);

    if (!balance) {
      balance = {
        id: uuidv4(),
        userId,
        totalPoints: 0,
        availablePoints: 0,
        frozenPoints: 0,
        usedPoints: 0,
        level: 'new',
        levelName: '新会员',
        nextLevelPoints: 1000,
        updatedAt: new Date().toISOString()
      };
      balances.push(balance);
    }

    const beforeBalance = balance.availablePoints;
    balance.totalPoints += points;
    balance.availablePoints += points;
    balance.updatedAt = new Date().toISOString();
    writeData(POINTS_BALANCE_FILE, balances);

    const transaction = {
      id: uuidv4(),
      userId,
      type: 'earn',
      subtype: type,
      points,
      beforeBalance,
      afterBalance: balance.availablePoints,
      description: description || '获取积分',
      relatedOrderId,
      source,
      createdAt: new Date().toISOString()
    };

    const transactions = readData(POINTS_TRANSACTIONS_FILE, defaultTransactions);
    transactions.unshift(transaction);
    writeData(POINTS_TRANSACTIONS_FILE, transactions);

    log('info', '获取积分成功', { userId, points, type });
    res.json({ 
      success: true, 
      data: { balance, transaction },
      message: 'Points earned successfully'
    });
  } catch (error) {
    log('error', '获取积分失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/transactions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    let transactions = readData(POINTS_TRANSACTIONS_FILE, defaultTransactions)
      .filter(t => t.userId === userId)
      .map(t => ({
        ...t,
        formattedCreatedAt: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss')
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    const total = transactions.length;
    const paginated = transactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    const statistics = {
      totalEarned: transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.points, 0),
      totalSpent: Math.abs(transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.points, 0)),
      thisMonthEarned: transactions
        .filter(t => t.type === 'earn' && new Date(t.createdAt).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.points, 0)
    };

    log('info', '获取积分明细', { userId, count: paginated.length });
    res.json({
      success: true,
      data: paginated,
      statistics,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取积分明细失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products', (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let products = readData(POINTS_PRODUCTS_FILE, defaultProducts)
      .filter(p => p.status === 'active');

    if (category) {
      products = products.filter(p => p.category === category);
    }

    products = products.map(p => ({
      ...p,
      remainingStock: p.stock - p.soldCount
    }));

    const total = products.length;
    const paginated = products.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    const categories = [...new Set(products.map(p => p.category))];

    log('info', '获取积分商品列表', { count: paginated.length });
    res.json({
      success: true,
      data: paginated,
      categories,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取积分商品失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products/:id/exchange', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, quantity = 1 } = req.body;

    const products = readData(POINTS_PRODUCTS_FILE, defaultProducts);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[productIndex];
    if (product.status !== 'active') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    const remainingStock = product.stock - product.soldCount;
    if (remainingStock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const totalPoints = product.pointsPrice * quantity;

    const balances = readData(POINTS_BALANCE_FILE, defaultBalances);
    const balanceIndex = balances.findIndex(b => b.userId === userId);

    if (balanceIndex === -1) {
      return res.status(404).json({ error: 'User balance not found' });
    }

    const balance = balances[balanceIndex];
    if (balance.availablePoints < totalPoints) {
      return res.status(400).json({ 
        error: 'Insufficient points',
        required: totalPoints,
        available: balance.availablePoints
      });
    }

    const orders = readData(POINTS_ORDERS_FILE, []);
    const userExchangeCount = orders.filter(o => o.userId === userId && o.productId === id).length;

    if (userExchangeCount + quantity > product.exchangeLimit) {
      return res.status(400).json({ 
        error: 'Exchange limit exceeded',
        limit: product.exchangeLimit
      });
    }

    const beforeBalance = balance.availablePoints;
    balance.availablePoints -= totalPoints;
    balance.usedPoints += totalPoints;
    balance.updatedAt = new Date().toISOString();
    writeData(POINTS_BALANCE_FILE, balances);

    products[productIndex].soldCount += quantity;
    writeData(POINTS_PRODUCTS_FILE, products);

    const order = {
      id: uuidv4(),
      orderNo: `PO${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId,
      productId: id,
      product: {
        name: product.name,
        type: product.type,
        description: product.description,
        image: product.image
      },
      quantity,
      pointsPrice: product.pointsPrice,
      totalPoints,
      status: 'success',
      validUntil: addDays(new Date(), product.expiryDays).toISOString(),
      createdAt: new Date().toISOString()
    };

    orders.unshift(order);
    writeData(POINTS_ORDERS_FILE, orders);

    const transaction = {
      id: uuidv4(),
      userId,
      type: 'spend',
      subtype: 'exchange',
      points: -totalPoints,
      beforeBalance,
      afterBalance: balance.availablePoints,
      description: `兑换${product.name}`,
      relatedOrderId: order.id,
      source: 'points-service',
      createdAt: new Date().toISOString()
    };

    const transactions = readData(POINTS_TRANSACTIONS_FILE, defaultTransactions);
    transactions.unshift(transaction);
    writeData(POINTS_TRANSACTIONS_FILE, transactions);

    log('info', '积分兑换成功', { 
      userId, 
      productId: id, 
      totalPoints 
    });

    res.status(201).json({ 
      success: true, 
      data: { order, balance },
      message: 'Exchange successful'
    });
  } catch (error) {
    log('error', '积分兑换失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`积分服务运行在 http://localhost:${PORT}`);
});
