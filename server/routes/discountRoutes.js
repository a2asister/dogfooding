const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { DiscountStore, SkuStore } = require('../data/store');

// 获取所有优惠
router.get('/', (req, res) => {
  try {
    const discounts = DiscountStore.getAll();
    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取优惠列表失败',
      error: error.message
    });
  }
});

// 获取单个优惠
router.get('/:id', (req, res) => {
  try {
    const discountId = req.params.id;
    const discount = DiscountStore.getById(discountId);
    
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: '优惠不存在'
      });
    }
    
    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取优惠详情失败',
      error: error.message
    });
  }
});

// 创建新优惠
router.post('/', (req, res) => {
  try {
    const { 
      name, 
      type, 
      value, 
      minAmount, 
      maxDiscount, 
      applicableProductIds,
      applicableCategory,
      excludeProductIds,
      stackable,
      priority,
      startDate,
      endDate,
      description
    } = req.body;
    
    if (!name || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, type, value为必填项'
      });
    }
    
    if (!['percentage', 'fixed', 'fullReduction'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type必须是percentage, fixed或fullReduction'
      });
    }
    
    const newDiscount = {
      id: uuidv4(),
      name,
      type,
      value: parseFloat(value),
      minAmount: minAmount !== undefined ? parseFloat(minAmount) : 0,
      maxDiscount: maxDiscount !== undefined ? parseFloat(maxDiscount) : null,
      applicableProductIds: applicableProductIds || [],
      applicableCategory: applicableCategory || null,
      excludeProductIds: excludeProductIds || [],
      stackable: stackable !== undefined ? stackable : true,
      priority: priority !== undefined ? parseInt(priority) : 1,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: description || '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = DiscountStore.create(newDiscount);
    
    if (success) {
      res.json({
        success: true,
        message: '优惠创建成功',
        data: newDiscount
      });
    } else {
      res.status(500).json({
        success: false,
        message: '优惠创建失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建优惠失败',
      error: error.message
    });
  }
});

// 计算优惠叠加（核心逻辑）
router.post('/calculate', (req, res) => {
  try {
    const { items, discountIds } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'items为必填项，且必须是数组'
      });
    }
    
    // 获取所有活跃的优惠
    let applicableDiscounts = DiscountStore.getActive();
    
    // 如果指定了优惠ID，只使用这些优惠
    if (discountIds && Array.isArray(discountIds) && discountIds.length > 0) {
      applicableDiscounts = applicableDiscounts.filter(d => 
        discountIds.includes(d.id)
      );
    }
    
    // 计算优惠
    const calculationResult = calculateDiscounts(items, applicableDiscounts);
    
    res.json({
      success: true,
      data: calculationResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '计算优惠失败',
      error: error.message
    });
  }
});

// 更新优惠
router.put('/:id', (req, res) => {
  try {
    const discountId = req.params.id;
    const { 
      name, 
      type, 
      value, 
      minAmount, 
      maxDiscount, 
      applicableProductIds,
      applicableCategory,
      excludeProductIds,
      stackable,
      priority,
      startDate,
      endDate,
      description,
      active
    } = req.body;
    
    const existingDiscount = DiscountStore.getById(discountId);
    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: '优惠不存在'
      });
    }
    
    const updatedDiscount = {
      name: name || existingDiscount.name,
      type: type || existingDiscount.type,
      value: value !== undefined ? parseFloat(value) : existingDiscount.value,
      minAmount: minAmount !== undefined ? parseFloat(minAmount) : existingDiscount.minAmount,
      maxDiscount: maxDiscount !== undefined ? parseFloat(maxDiscount) : existingDiscount.maxDiscount,
      applicableProductIds: applicableProductIds || existingDiscount.applicableProductIds,
      applicableCategory: applicableCategory !== undefined ? applicableCategory : existingDiscount.applicableCategory,
      excludeProductIds: excludeProductIds || existingDiscount.excludeProductIds,
      stackable: stackable !== undefined ? stackable : existingDiscount.stackable,
      priority: priority !== undefined ? parseInt(priority) : existingDiscount.priority,
      startDate: startDate || existingDiscount.startDate,
      endDate: endDate || existingDiscount.endDate,
      description: description !== undefined ? description : existingDiscount.description,
      active: active !== undefined ? active : existingDiscount.active,
      updatedAt: new Date().toISOString()
    };
    
    const success = DiscountStore.update(discountId, updatedDiscount);
    
    if (success) {
      res.json({
        success: true,
        message: '优惠更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '优惠更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新优惠失败',
      error: error.message
    });
  }
});

// 删除优惠
router.delete('/:id', (req, res) => {
  try {
    const discountId = req.params.id;
    
    const existingDiscount = DiscountStore.getById(discountId);
    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        message: '优惠不存在'
      });
    }
    
    const success = DiscountStore.delete(discountId);
    
    if (success) {
      res.json({
        success: true,
        message: '优惠删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '优惠删除失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除优惠失败',
      error: error.message
    });
  }
});

// 核心优惠计算函数
function calculateDiscounts(items, discounts) {
  // 计算原始总价
  let subtotal = 0;
  const itemDetails = items.map(item => {
    const sku = SkuStore.getById(item.skuId);
    const price = sku ? sku.price : item.price || 0;
    const quantity = item.quantity || 1;
    const itemTotal = price * quantity;
    subtotal += itemTotal;
    
    return {
      ...item,
      sku,
      price,
      quantity,
      itemTotal,
      productId: sku ? sku.productId : item.productId
    };
  });
  
  // 按优先级排序优惠
  const sortedDiscounts = [...discounts].sort((a, b) => a.priority - b.priority);
  
  let totalDiscount = 0;
  const appliedDiscounts = [];
  let currentPrice = subtotal;
  
  // 找出所有不可叠加的优惠
  const nonStackableDiscounts = sortedDiscounts.filter(d => !d.stackable);
  const stackableDiscounts = sortedDiscounts.filter(d => d.stackable);
  
  // 如果有不可叠加的优惠，选择最优惠的那个
  if (nonStackableDiscounts.length > 0) {
    let bestNonStackableDiscount = null;
    let bestNonStackableDiscountAmount = 0;
    
    for (const discount of nonStackableDiscounts) {
      const applicableItems = getApplicableItems(itemDetails, discount);
      if (applicableItems.length === 0) continue;
      
      const discountAmount = calculateSingleDiscount(applicableItems, discount, currentPrice);
      
      if (discountAmount > bestNonStackableDiscountAmount) {
        bestNonStackableDiscountAmount = discountAmount;
        bestNonStackableDiscount = {
          ...discount,
          discountAmount,
          applicableItems
        };
      }
    }
    
    if (bestNonStackableDiscount) {
      totalDiscount += bestNonStackableDiscountAmount;
      currentPrice -= bestNonStackableDiscountAmount;
      appliedDiscounts.push(bestNonStackableDiscount);
    }
  }
  
  // 应用所有可叠加的优惠
  for (const discount of stackableDiscounts) {
    const applicableItems = getApplicableItems(itemDetails, discount);
    if (applicableItems.length === 0) continue;
    
    const discountAmount = calculateSingleDiscount(applicableItems, discount, currentPrice);
    
    if (discountAmount > 0) {
      totalDiscount += discountAmount;
      currentPrice -= discountAmount;
      appliedDiscounts.push({
        ...discount,
        discountAmount,
        applicableItems
      });
    }
  }
  
  return {
    subtotal,
    totalDiscount,
    finalPrice: Math.max(0, currentPrice),
    appliedDiscounts: appliedDiscounts.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      discountAmount: d.discountAmount,
      description: d.description
    })),
    itemDetails
  };
}

// 计算单个优惠的金额
function calculateSingleDiscount(applicableItems, discount, currentPrice) {
  if (applicableItems.length === 0) return 0;
  
  // 计算适用商品的总价
  const applicableTotal = applicableItems.reduce((sum, item) => sum + item.itemTotal, 0);
  
  // 检查是否满足最低金额
  if (discount.minAmount && applicableTotal < discount.minAmount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  switch (discount.type) {
    case 'percentage':
      // 百分比折扣：按适用商品总价的百分比计算
      discountAmount = applicableTotal * (discount.value / 100);
      break;
      
    case 'fixed':
      // 固定金额折扣
      discountAmount = discount.value;
      break;
      
    case 'fullReduction':
      // 满减：每满minAmount减value
      const times = Math.floor(applicableTotal / discount.minAmount);
      discountAmount = times * discount.value;
      break;
      
    default:
      return 0;
  }
  
  // 应用最大折扣限制
  if (discount.maxDiscount !== null && discountAmount > discount.maxDiscount) {
    discountAmount = discount.maxDiscount;
  }
  
  // 折扣不能超过当前价格
  return Math.min(discountAmount, currentPrice);
}

// 获取适用某优惠的商品
function getApplicableItems(itemDetails, discount) {
  return itemDetails.filter(item => {
    // 检查排除商品
    if (discount.excludeProductIds && discount.excludeProductIds.includes(item.productId)) {
      return false;
    }
    
    // 检查适用商品（如果指定了）
    if (discount.applicableProductIds && discount.applicableProductIds.length > 0) {
      return discount.applicableProductIds.includes(item.productId);
    }
    
    // 检查适用分类（如果指定了）
    if (discount.applicableCategory) {
      // 这里需要根据实际商品分类逻辑调整
      return true; // 简化处理，假设分类匹配
    }
    
    // 默认所有商品都适用
    return true;
  });
}

module.exports = router;