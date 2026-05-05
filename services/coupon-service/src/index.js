const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isBefore, isAfter, format, addDays } = require('date-fns');

const app = express();
const PORT = 3005;

const DATA_DIR = path.join(__dirname, '../../data');
const COUPON_FILE = path.join(DATA_DIR, 'coupons.json');
const USER_COUPON_FILE = path.join(DATA_DIR, 'user-coupons.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultCoupons = [
  {
    id: uuidv4(),
    name: '新人专享优惠券',
    type: 'new_user',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 200,
    maxDiscount: 100,
    totalQuantity: 1000,
    usedQuantity: 156,
    status: 'active',
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    description: '新用户专属，满200减100',
    applicableCategories: ['all'],
    isNewUserOnly: true,
    limitPerUser: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '满500减50',
    type: 'common',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 500,
    maxDiscount: 50,
    totalQuantity: 5000,
    usedQuantity: 2345,
    status: 'active',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: '全场通用，满500减50',
    applicableCategories: ['all'],
    isNewUserOnly: false,
    limitPerUser: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '9折优惠券',
    type: 'common',
    discountType: 'percent',
    discountValue: 0.1,
    minOrderAmount: 100,
    maxDiscount: 200,
    totalQuantity: 3000,
    usedQuantity: 876,
    status: 'active',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: '全场9折，最高减200',
    applicableCategories: ['all'],
    isNewUserOnly: false,
    limitPerUser: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '数码品类券',
    type: 'category',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1000,
    maxDiscount: 200,
    totalQuantity: 1000,
    usedQuantity: 0,
    status: 'scheduled',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: '数码品类满1000减200',
    applicableCategories: ['手机数码', '电脑办公'],
    isNewUserOnly: false,
    limitPerUser: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultUserCoupons = [
  {
    id: uuidv4(),
    couponId: defaultCoupons[0].id,
    userId: 'user_001',
    status: 'unused',
    receivedAt: new Date().toISOString(),
    validUntil: addDays(new Date(), 30).toISOString(),
    usedAt: null
  },
  {
    id: uuidv4(),
    couponId: defaultCoupons[1].id,
    userId: 'user_001',
    status: 'unused',
    receivedAt: new Date().toISOString(),
    validUntil: addDays(new Date(), 15).toISOString(),
    usedAt: null
  },
  {
    id: uuidv4(),
    couponId: defaultCoupons[2].id,
    userId: 'user_001',
    status: 'used',
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: addDays(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 20).toISOString(),
    usedAt: new Date().toISOString()
  }
];

if (!fs.existsSync(COUPON_FILE)) {
  fs.writeFileSync(COUPON_FILE, JSON.stringify(defaultCoupons, null, 2));
}

if (!fs.existsSync(USER_COUPON_FILE)) {
  fs.writeFileSync(USER_COUPON_FILE, JSON.stringify(defaultUserCoupons, null, 2));
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
        service: 'coupon-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readCoupons = () => {
  try {
    const data = fs.readFileSync(COUPON_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultCoupons;
  }
};

const writeCoupons = (coupons) => {
  fs.writeFileSync(COUPON_FILE, JSON.stringify(coupons, null, 2));
};

const readUserCoupons = () => {
  try {
    const data = fs.readFileSync(USER_COUPON_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultUserCoupons;
  }
};

const writeUserCoupons = (userCoupons) => {
  fs.writeFileSync(USER_COUPON_FILE, JSON.stringify(userCoupons, null, 2));
};

const calculateStatus = (coupon) => {
  const now = new Date();
  const start = new Date(coupon.startTime);
  const end = new Date(coupon.endTime);

  if (isBefore(now, start)) return 'scheduled';
  if (isAfter(now, end)) return 'ended';
  if (coupon.usedQuantity >= coupon.totalQuantity) return 'sold_out';
  return 'active';
};

app.get('/api/coupons', (req, res) => {
  try {
    const { status, type, keyword, limit = 20, offset = 0 } = req.query;
    let coupons = readCoupons();

    coupons = coupons.map(coupon => ({
      ...coupon,
      status: calculateStatus(coupon),
      remainingQuantity: coupon.totalQuantity - coupon.usedQuantity,
      formattedStartTime: format(new Date(coupon.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(coupon.endTime), 'yyyy-MM-dd HH:mm:ss')
    }));

    if (status) {
      coupons = coupons.filter(c => c.status === status);
    }

    if (type) {
      coupons = coupons.filter(c => c.type === type);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      coupons = coupons.filter(c => 
        c.name.toLowerCase().includes(kw) || 
        c.description.toLowerCase().includes(kw)
      );
    }

    const total = coupons.length;
    const paginated = coupons.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取优惠券列表成功', { count: paginated.length });

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
    log('error', '获取优惠券列表失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/coupons/available', (req, res) => {
  try {
    let coupons = readCoupons();

    coupons = coupons
      .map(coupon => ({
        ...coupon,
        status: calculateStatus(coupon),
        remainingQuantity: coupon.totalQuantity - coupon.usedQuantity,
        formattedStartTime: format(new Date(coupon.startTime), 'yyyy-MM-dd HH:mm:ss'),
        formattedEndTime: format(new Date(coupon.endTime), 'yyyy-MM-dd HH:mm:ss')
      }))
      .filter(c => c.status === 'active')
      .sort((a, b) => {
        if (a.isNewUserOnly && !b.isNewUserOnly) return -1;
        if (!a.isNewUserOnly && b.isNewUserOnly) return 1;
        return a.createdAt - b.createdAt;
      });

    const newUserCoupons = coupons.filter(c => c.isNewUserOnly);
    const commonCoupons = coupons.filter(c => !c.isNewUserOnly);

    log('info', '获取可用优惠券', { newUser: newUserCoupons.length, common: commonCoupons.length });

    res.json({
      success: true,
      data: {
        newUser: newUserCoupons,
        common: commonCoupons
      }
    });
  } catch (error) {
    log('error', '获取可用优惠券失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/coupons/:id', (req, res) => {
  try {
    const { id } = req.params;
    const coupons = readCoupons();
    const coupon = coupons.find(c => c.id === id);

    if (!coupon) {
      log('warn', '优惠券不存在', { id });
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const enrichedCoupon = {
      ...coupon,
      status: calculateStatus(coupon),
      remainingQuantity: coupon.totalQuantity - coupon.usedQuantity,
      formattedStartTime: format(new Date(coupon.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(coupon.endTime), 'yyyy-MM-dd HH:mm:ss')
    };

    log('info', '获取优惠券详情成功', { id, name: coupon.name });
    res.json({ success: true, data: enrichedCoupon });
  } catch (error) {
    log('error', '获取优惠券详情失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/coupons/:id/claim', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, isNewUser = false } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const coupons = readCoupons();
    const couponIndex = coupons.findIndex(c => c.id === id);

    if (couponIndex === -1) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const coupon = coupons[couponIndex];
    const status = calculateStatus(coupon);

    if (status !== 'active') {
      return res.status(400).json({ error: 'Coupon is not available' });
    }

    if (coupon.isNewUserOnly && !isNewUser) {
      return res.status(400).json({ error: 'This coupon is for new users only' });
    }

    const userCoupons = readUserCoupons();
    const userOwnedCount = userCoupons.filter(
      uc => uc.couponId === id && uc.userId === userId
    ).length;

    if (userOwnedCount >= coupon.limitPerUser) {
      return res.status(400).json({ 
        error: 'You have reached the limit for this coupon',
        limit: coupon.limitPerUser
      });
    }

    const newUserCoupon = {
      id: uuidv4(),
      couponId: id,
      userId,
      status: 'unused',
      receivedAt: new Date().toISOString(),
      validUntil: coupon.endTime,
      usedAt: null
    };

    userCoupons.push(newUserCoupon);
    writeUserCoupons(userCoupons);

    coupons[couponIndex].usedQuantity += 1;
    writeCoupons(coupons);

    log('info', '领取优惠券成功', { 
      userCouponId: newUserCoupon.id,
      couponId: id,
      userId 
    });

    res.status(201).json({ 
      success: true, 
      data: newUserCoupon,
      message: 'Coupon claimed successfully'
    });
  } catch (error) {
    log('error', '领取优惠券失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user-coupons/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    const coupons = readCoupons();
    const couponMap = new Map(coupons.map(c => [c.id, c]));

    let userCoupons = readUserCoupons()
      .filter(uc => uc.userId === userId)
      .map(uc => {
        const coupon = couponMap.get(uc.couponId);
        return {
          ...uc,
          coupon: coupon ? {
            ...coupon,
            formattedStartTime: format(new Date(coupon.startTime), 'yyyy-MM-dd HH:mm:ss'),
            formattedEndTime: format(new Date(coupon.endTime), 'yyyy-MM-dd HH:mm:ss')
          } : null,
          formattedReceivedAt: format(new Date(uc.receivedAt), 'yyyy-MM-dd HH:mm:ss'),
          formattedValidUntil: uc.validUntil ? format(new Date(uc.validUntil), 'yyyy-MM-dd HH:mm:ss') : null
        };
      })
      .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

    if (status) {
      userCoupons = userCoupons.filter(uc => uc.status === status);
    }

    const total = userCoupons.length;
    const paginated = userCoupons.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取用户优惠券列表', { userId, count: paginated.length });

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
    log('error', '获取用户优惠券失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/user-coupons/:id/use', (req, res) => {
  try {
    const { id } = req.params;
    const { orderAmount, orderId } = req.body;

    const userCoupons = readUserCoupons();
    const userCouponIndex = userCoupons.findIndex(uc => uc.id === id);

    if (userCouponIndex === -1) {
      return res.status(404).json({ error: 'User coupon not found' });
    }

    const userCoupon = userCoupons[userCouponIndex];

    if (userCoupon.status !== 'unused') {
      return res.status(400).json({ error: 'Coupon is not available for use' });
    }

    const now = new Date();
    if (userCoupon.validUntil && isAfter(now, new Date(userCoupon.validUntil))) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    const coupons = readCoupons();
    const coupon = coupons.find(c => c.id === userCoupon.couponId);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon template not found' });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        error: 'Order amount does not meet minimum requirement',
        minRequired: coupon.minOrderAmount
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'percent') {
      discountAmount = orderAmount * coupon.discountValue;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    userCoupons[userCouponIndex].status = 'used';
    userCoupons[userCouponIndex].usedAt = new Date().toISOString();
    userCoupons[userCouponIndex].orderId = orderId;
    userCoupons[userCouponIndex].orderAmount = orderAmount;
    userCoupons[userCouponIndex].discountAmount = discountAmount;
    writeUserCoupons(userCoupons);

    log('info', '使用优惠券成功', { 
      userCouponId: id,
      discountAmount,
      orderAmount
    });

    res.json({ 
      success: true, 
      data: {
        ...userCoupons[userCouponIndex],
        discountAmount
      },
      message: 'Coupon used successfully'
    });
  } catch (error) {
    log('error', '使用优惠券失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`优惠券服务运行在 http://localhost:${PORT}`);
});
