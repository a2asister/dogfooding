const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('koa2-cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
const router = new Router();

app.use(koaBody());
app.use(cors());

const DATA_DIR = path.join(__dirname, '../data');
const COUPONS_FILE = path.join(DATA_DIR, 'coupons.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(COUPONS_FILE)) {
  fs.writeFileSync(COUPONS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
}

function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 优惠券 API
router.get('/api/coupons', (ctx) => {
  const coupons = readData(COUPONS_FILE);
  ctx.body = { success: true, data: coupons };
});

router.get('/api/coupons/:id', (ctx) => {
  const coupons = readData(COUPONS_FILE);
  const coupon = coupons.find(c => c.id === ctx.params.id);
  
  if (coupon) {
    ctx.body = { success: true, data: coupon };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '优惠券不存在' };
  }
});

router.post('/api/coupons', (ctx) => {
  const coupons = readData(COUPONS_FILE);
  const newCoupon = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  coupons.push(newCoupon);
  writeData(COUPONS_FILE, coupons);
  
  ctx.body = { success: true, data: newCoupon };
});

router.put('/api/coupons/:id', (ctx) => {
  const coupons = readData(COUPONS_FILE);
  const index = coupons.findIndex(c => c.id === ctx.params.id);
  
  if (index !== -1) {
    coupons[index] = {
      ...coupons[index],
      ...ctx.request.body,
      updatedAt: new Date().toISOString()
    };
    writeData(COUPONS_FILE, coupons);
    
    ctx.body = { success: true, data: coupons[index] };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '优惠券不存在' };
  }
});

router.delete('/api/coupons/:id', (ctx) => {
  const coupons = readData(COUPONS_FILE);
  const index = coupons.findIndex(c => c.id === ctx.params.id);
  
  if (index !== -1) {
    coupons.splice(index, 1);
    writeData(COUPONS_FILE, coupons);
    
    ctx.body = { success: true, message: '删除成功' };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '优惠券不存在' };
  }
});

// 商品 API
router.get('/api/products', (ctx) => {
  const products = readData(PRODUCTS_FILE);
  ctx.body = { success: true, data: products };
});

router.get('/api/products/:id', (ctx) => {
  const products = readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === ctx.params.id);
  
  if (product) {
    ctx.body = { success: true, data: product };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '商品不存在' };
  }
});

router.post('/api/products', (ctx) => {
  const products = readData(PRODUCTS_FILE);
  const newProduct = {
    id: uuidv4(),
    ...ctx.request.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  writeData(PRODUCTS_FILE, products);
  
  ctx.body = { success: true, data: newProduct };
});

router.put('/api/products/:id', (ctx) => {
  const products = readData(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === ctx.params.id);
  
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...ctx.request.body,
      updatedAt: new Date().toISOString()
    };
    writeData(PRODUCTS_FILE, products);
    
    ctx.body = { success: true, data: products[index] };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '商品不存在' };
  }
});

router.delete('/api/products/:id', (ctx) => {
  const products = readData(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === ctx.params.id);
  
  if (index !== -1) {
    products.splice(index, 1);
    writeData(PRODUCTS_FILE, products);
    
    ctx.body = { success: true, message: '删除成功' };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '商品不存在' };
  }
});

// 价格计算 API
router.post('/api/calculate', (ctx) => {
  const { productId, couponIds, quantity = 1 } = ctx.request.body;
  const products = readData(PRODUCTS_FILE);
  const coupons = readData(COUPONS_FILE);
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    ctx.status = 404;
    ctx.body = { success: false, message: '商品不存在' };
    return;
  }
  
  const selectedCoupons = coupons.filter(c => couponIds.includes(c.id));
  const calculationResult = calculateDiscount(product, selectedCoupons, quantity);
  
  ctx.body = { success: true, data: calculationResult };
});

// 批量计算 API
router.post('/api/calculate/batch', (ctx) => {
  const { items, couponIds } = ctx.request.body;
  const products = readData(PRODUCTS_FILE);
  const coupons = readData(COUPONS_FILE);
  
  const selectedCoupons = coupons.filter(c => couponIds.includes(c.id));
  const results = [];
  let totalOriginalPrice = 0;
  let totalFinalPrice = 0;
  
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const itemResult = calculateDiscount(product, selectedCoupons, item.quantity || 1);
      results.push({
        productId: item.productId,
        product,
        ...itemResult
      });
      totalOriginalPrice += itemResult.originalPrice;
      totalFinalPrice += itemResult.finalPrice;
    }
  }
  
  ctx.body = {
    success: true,
    data: {
      items: results,
      totalOriginalPrice,
      totalFinalPrice,
      totalDiscount: totalOriginalPrice - totalFinalPrice
    }
  };
});

// 优惠券规则引擎
function calculateDiscount(product, coupons, quantity = 1) {
  const originalPrice = product.price * quantity;
  let finalPrice = originalPrice;
  const applicableCoupons = [];
  const nonApplicableCoupons = [];
  let discountDetails = [];
  
  // 过滤可用优惠券
  for (const coupon of coupons) {
    const result = isCouponApplicable(coupon, product, originalPrice);
    if (result.applicable) {
      applicableCoupons.push({ coupon, result });
    } else {
      nonApplicableCoupons.push({ coupon, reason: result.reason });
    }
  }
  
  // 处理叠加和互斥规则
  const sortedCoupons = sortCouponsByPriority(applicableCoupons);
  const validCoupons = processStackingRules(sortedCoupons);
  
  // 应用优惠券
  let currentPrice = originalPrice;
  
  for (const item of validCoupons) {
    const { coupon, result } = item;
    const discount = applyCoupon(coupon, currentPrice, product);
    currentPrice = discount.finalPrice;
    
    discountDetails.push({
      couponId: coupon.id,
      couponName: coupon.name,
      couponType: coupon.type,
      discountAmount: discount.discountAmount,
      discountDescription: discount.description
    });
  }
  
  finalPrice = currentPrice;
  
  // 确保价格不低于0
  if (finalPrice < 0) {
    finalPrice = 0;
  }
  
  return {
    originalPrice,
    finalPrice,
    discountAmount: originalPrice - finalPrice,
    applicableCoupons: validCoupons.map(c => ({
      id: c.coupon.id,
      name: c.coupon.name,
      type: c.coupon.type
    })),
    nonApplicableCoupons: nonApplicableCoupons.map(c => ({
      id: c.coupon.id,
      name: c.coupon.name,
      type: c.coupon.type,
      reason: c.reason
    })),
    discountDetails
  };
}

function isCouponApplicable(coupon, product, totalPrice) {
  const now = new Date();
  
  // 检查是否过期
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return { applicable: false, reason: '优惠券已过期' };
  }
  
  // 检查是否启用
  if (coupon.status !== 'active') {
    return { applicable: false, reason: '优惠券未激活' };
  }
  
  // 检查品类限制
  if (coupon.categoryRestrictions && coupon.categoryRestrictions.length > 0) {
    if (!coupon.categoryRestrictions.includes(product.category)) {
      return { applicable: false, reason: `商品品类不匹配，仅限品类: ${coupon.categoryRestrictions.join(', ')}` };
    }
  }
  
  // 检查最低消费金额
  if (coupon.minAmount && totalPrice < coupon.minAmount) {
    return { applicable: false, reason: `最低消费金额不足，需满 ${coupon.minAmount} 元` };
  }
  
  // 检查使用次数限制
  if (coupon.maxUses !== undefined && coupon.usedCount !== undefined) {
    if (coupon.usedCount >= coupon.maxUses) {
      return { applicable: false, reason: '优惠券已达到最大使用次数' };
    }
  }
  
  return { applicable: true };
}

function sortCouponsByPriority(coupons) {
  const priorityOrder = {
    'fixed_amount': 1,  // 满减优先
    'percentage': 2,    // 折扣次之
    'free_shipping': 3  // 免邮最后
  };
  
  return [...coupons].sort((a, b) => {
    const priorityA = priorityOrder[a.coupon.type] || 999;
    const priorityB = priorityOrder[b.coupon.type] || 999;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // 同类型按优惠力度排序
    if (a.coupon.type === 'fixed_amount') {
      return (b.coupon.amount || 0) - (a.coupon.amount || 0);
    } else if (a.coupon.type === 'percentage') {
      return (b.coupon.percentage || 0) - (a.coupon.percentage || 0);
    }
    
    return 0;
  });
}

function processStackingRules(coupons) {
  const result = [];
  const mutexGroups = {};
  
  for (const item of coupons) {
    const { coupon } = item;
    
    // 处理互斥规则
    if (coupon.mutexCoupons && coupon.mutexCoupons.length > 0) {
      // 检查是否已经添加了互斥的优惠券
      const hasMutex = result.some(c => 
        coupon.mutexCoupons.includes(c.coupon.id) ||
        c.coupon.mutexCoupons?.includes(coupon.id)
      );
      
      if (hasMutex) {
        continue;
      }
    }
    
    // 处理互斥组
    if (coupon.mutexGroup) {
      if (mutexGroups[coupon.mutexGroup]) {
        // 同组互斥，跳过
        continue;
      }
      mutexGroups[coupon.mutexGroup] = true;
    }
    
    // 处理叠加限制
    if (coupon.maxStackCount !== undefined) {
      const sameTypeCount = result.filter(c => c.coupon.type === coupon.type).length;
      if (sameTypeCount >= coupon.maxStackCount) {
        continue;
      }
    }
    
    result.push(item);
  }
  
  return result;
}

function applyCoupon(coupon, currentPrice, product) {
  let discountAmount = 0;
  let description = '';
  
  switch (coupon.type) {
    case 'fixed_amount':
      discountAmount = coupon.amount || 0;
      // 检查最低消费
      if (coupon.minAmount && currentPrice < coupon.minAmount) {
        discountAmount = 0;
        description = '未达到最低消费金额';
      } else {
        description = `满${coupon.minAmount || 0}减${coupon.amount}元`;
      }
      break;
      
    case 'percentage':
      discountAmount = currentPrice * (1 - (coupon.percentage / 100));
      // 检查最低消费
      if (coupon.minAmount && currentPrice < coupon.minAmount) {
        discountAmount = 0;
        description = '未达到最低消费金额';
      } else {
        // 检查最大折扣金额
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
          description = `${coupon.percentage}折，最高减${coupon.maxDiscountAmount}元`;
        } else {
          description = `${coupon.percentage}折优惠`;
        }
      }
      break;
      
    case 'free_shipping':
      // 免邮券不影响价格，但可以标记
      description = '免运费';
      discountAmount = 0;
      break;
      
    case 'buy_x_get_y':
      // 买X送Y券的处理
      if (coupon.buyQuantity && coupon.getQuantity) {
        const unitPrice = product.price;
        const totalItems = Math.floor(currentPrice / unitPrice);
        const freeItems = Math.floor(totalItems / (coupon.buyQuantity + coupon.getQuantity)) * coupon.getQuantity;
        discountAmount = freeItems * unitPrice;
        description = `买${coupon.buyQuantity}送${coupon.getQuantity}`;
      }
      break;
      
    default:
      description = '未知优惠券类型';
  }
  
  return {
    finalPrice: currentPrice - discountAmount,
    discountAmount,
    description
  };
}

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`优惠券服务运行在 http://localhost:${PORT}`);
});
