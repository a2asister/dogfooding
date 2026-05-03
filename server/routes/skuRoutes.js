const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { SkuStore, ProductStore } = require('../data/store');

// 获取所有SKU
router.get('/', (req, res) => {
  try {
    const skus = SkuStore.getAll();
    res.json({
      success: true,
      data: skus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取SKU列表失败',
      error: error.message
    });
  }
});

// 根据产品ID获取SKU列表
router.get('/product/:productId', (req, res) => {
  try {
    const productId = req.params.productId;
    const skus = SkuStore.getByProductId(productId);
    
    res.json({
      success: true,
      data: skus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品SKU列表失败',
      error: error.message
    });
  }
});

// 获取单个SKU
router.get('/:id', (req, res) => {
  try {
    const skuId = req.params.id;
    const sku = SkuStore.getById(skuId);
    
    if (!sku) {
      return res.status(404).json({
        success: false,
        message: 'SKU不存在'
      });
    }
    
    res.json({
      success: true,
      data: sku
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取SKU详情失败',
      error: error.message
    });
  }
});

// 创建新SKU
router.post('/', (req, res) => {
  try {
    const { productId, specs, price, stock, image } = req.body;
    
    if (!productId || !specs || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'productId, specs, price, stock为必填项'
      });
    }
    
    const existingProduct = ProductStore.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    // 检查是否有相同规格的SKU（库存互斥）
    const existingSkus = SkuStore.getByProductId(productId);
    const duplicateSku = existingSkus.find(sku => {
      return JSON.stringify(sku.specs.sort()) === JSON.stringify(specs.sort());
    });
    
    if (duplicateSku) {
      return res.status(400).json({
        success: false,
        message: '已存在相同规格的SKU，规格必须唯一'
      });
    }
    
    const newSku = {
      id: uuidv4(),
      productId,
      specs,
      price: parseFloat(price),
      stock: parseInt(stock),
      image: image || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = SkuStore.create(newSku);
    
    if (success) {
      res.json({
        success: true,
        message: 'SKU创建成功',
        data: newSku
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'SKU创建失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建SKU失败',
      error: error.message
    });
  }
});

// 检查规格组合是否可用（多规格联动）
router.post('/check-specs', (req, res) => {
  try {
    const { productId, selectedSpecs } = req.body;
    
    if (!productId || !selectedSpecs) {
      return res.status(400).json({
        success: false,
        message: 'productId和selectedSpecs为必填项'
      });
    }
    
    const skus = SkuStore.getByProductId(productId);
    
    // 找到匹配的SKU
    const matchingSku = skus.find(sku => {
      // 检查所有选中的规格是否都存在于SKU中
      return selectedSpecs.every(selectedSpec => 
        sku.specs.some(spec => 
          spec.name === selectedSpec.name && spec.value === selectedSpec.value
        )
      );
    });
    
    // 获取所有可用的规格选项
    const availableSpecs = getAvailableSpecs(skus, selectedSpecs);
    
    res.json({
      success: true,
      data: {
        matchingSku,
        availableSpecs,
        hasStock: matchingSku ? matchingSku.stock > 0 : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '检查规格组合失败',
      error: error.message
    });
  }
});

// 更新SKU
router.put('/:id', (req, res) => {
  try {
    const skuId = req.params.id;
    const { specs, price, stock, image } = req.body;
    
    const existingSku = SkuStore.getById(skuId);
    if (!existingSku) {
      return res.status(404).json({
        success: false,
        message: 'SKU不存在'
      });
    }
    
    // 如果规格有变化，检查是否有重复规格
    if (specs && JSON.stringify(specs.sort()) !== JSON.stringify(existingSku.specs.sort())) {
      const existingSkus = SkuStore.getByProductId(existingSku.productId);
      const duplicateSku = existingSkus.find(sku => 
        sku.id !== skuId && 
        JSON.stringify(sku.specs.sort()) === JSON.stringify(specs.sort())
      );
      
      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: '已存在相同规格的SKU，规格必须唯一'
        });
      }
    }
    
    const updatedSku = {
      specs: specs || existingSku.specs,
      price: price !== undefined ? parseFloat(price) : existingSku.price,
      stock: stock !== undefined ? parseInt(stock) : existingSku.stock,
      image: image !== undefined ? image : existingSku.image,
      updatedAt: new Date().toISOString()
    };
    
    const success = SkuStore.update(skuId, updatedSku);
    
    if (success) {
      res.json({
        success: true,
        message: 'SKU更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'SKU更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新SKU失败',
      error: error.message
    });
  }
});

// 更新库存（库存互斥逻辑）
router.put('/:id/stock', (req, res) => {
  try {
    const skuId = req.params.id;
    const { stock, operation } = req.body; // operation: 'set', 'add', 'reduce'
    
    const existingSku = SkuStore.getById(skuId);
    if (!existingSku) {
      return res.status(404).json({
        success: false,
        message: 'SKU不存在'
      });
    }
    
    let newStock;
    switch (operation) {
      case 'set':
        if (stock === undefined) {
          return res.status(400).json({
            success: false,
            message: 'stock为必填项'
          });
        }
        newStock = parseInt(stock);
        break;
      case 'add':
        if (stock === undefined) {
          return res.status(400).json({
            success: false,
            message: 'stock为必填项'
          });
        }
        newStock = existingSku.stock + parseInt(stock);
        break;
      case 'reduce':
        if (stock === undefined) {
          return res.status(400).json({
            success: false,
            message: 'stock为必填项'
          });
        }
        newStock = existingSku.stock - parseInt(stock);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'operation必须是set, add或reduce'
        });
    }
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: '库存不能为负数'
      });
    }
    
    const success = SkuStore.updateStock(skuId, newStock);
    
    if (success) {
      res.json({
        success: true,
        message: '库存更新成功',
        data: {
          id: skuId,
          stock: newStock
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: '库存更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新库存失败',
      error: error.message
    });
  }
});

// 删除SKU
router.delete('/:id', (req, res) => {
  try {
    const skuId = req.params.id;
    
    const existingSku = SkuStore.getById(skuId);
    if (!existingSku) {
      return res.status(404).json({
        success: false,
        message: 'SKU不存在'
      });
    }
    
    const success = SkuStore.delete(skuId);
    
    if (success) {
      res.json({
        success: true,
        message: 'SKU删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'SKU删除失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除SKU失败',
      error: error.message
    });
  }
});

// 辅助函数：获取可用的规格选项
function getAvailableSpecs(skus, selectedSpecs) {
  // 收集所有可能的规格类型
  const allSpecTypes = new Set();
  skus.forEach(sku => {
    sku.specs.forEach(spec => {
      allSpecTypes.add(spec.name);
    });
  });
  
  const availableSpecs = [];
  
  // 对每种规格类型，找出可用的值
  allSpecTypes.forEach(specType => {
    // 找出当前规格类型中已选中的值
    const selectedValue = selectedSpecs.find(s => s.name === specType)?.value;
    
    // 找出所有可能的值
    const possibleValues = new Set();
    skus.forEach(sku => {
      sku.specs.forEach(spec => {
        if (spec.name === specType) {
          possibleValues.add(spec.value);
        }
      });
    });
    
    // 找出有库存的规格值
    const availableValues = [];
    possibleValues.forEach(value => {
      // 构建包含当前值和其他已选中值的规格组合
      const testSpecs = selectedSpecs
        .filter(s => s.name !== specType)
        .concat({ name: specType, value });
      
      // 检查是否有SKU匹配这些规格
      const hasMatchingSku = skus.some(sku => {
        return testSpecs.every(testSpec => 
          sku.specs.some(spec => 
            spec.name === testSpec.name && spec.value === testSpec.value
          )
        ) && sku.stock > 0;
      });
      
      availableValues.push({
        value,
        available: hasMatchingSku,
        selected: value === selectedValue
      });
    });
    
    availableSpecs.push({
      name: specType,
      values: availableValues
    });
  });
  
  return availableSpecs;
}

module.exports = router;