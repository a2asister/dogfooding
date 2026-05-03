const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ProductStore, SkuStore } = require('../data/store');

// 获取所有产品
router.get('/', (req, res) => {
  try {
    const products = ProductStore.getAll();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      error: error.message
    });
  }
});

// 获取单个产品详情
router.get('/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const product = ProductStore.getById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    const skus = SkuStore.getByProductId(productId);
    
    res.json({
      success: true,
      data: {
        ...product,
        skus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取产品详情失败',
      error: error.message
    });
  }
});

// 创建新产品
router.post('/', (req, res) => {
  try {
    const { name, description, price, image, category, specs } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: '产品名称和价格为必填项'
      });
    }
    
    const newProduct = {
      id: uuidv4(),
      name,
      description: description || '',
      price: parseFloat(price),
      image: image || '',
      category: category || '默认分类',
      specs: specs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = ProductStore.create(newProduct);
    
    if (success) {
      res.json({
        success: true,
        message: '产品创建成功',
        data: newProduct
      });
    } else {
      res.status(500).json({
        success: false,
        message: '产品创建失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建产品失败',
      error: error.message
    });
  }
});

// 更新产品
router.put('/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, image, category, specs } = req.body;
    
    const existingProduct = ProductStore.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    const updatedProduct = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price !== undefined ? parseFloat(price) : existingProduct.price,
      image: image || existingProduct.image,
      category: category || existingProduct.category,
      specs: specs || existingProduct.specs,
      updatedAt: new Date().toISOString()
    };
    
    const success = ProductStore.update(productId, updatedProduct);
    
    if (success) {
      res.json({
        success: true,
        message: '产品更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '产品更新失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新产品失败',
      error: error.message
    });
  }
});

// 删除产品
router.delete('/:id', (req, res) => {
  try {
    const productId = req.params.id;
    
    const existingProduct = ProductStore.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }
    
    // 删除产品相关的SKU
    SkuStore.deleteByProductId(productId);
    
    const success = ProductStore.delete(productId);
    
    if (success) {
      res.json({
        success: true,
        message: '产品删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '产品删除失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除产品失败',
      error: error.message
    });
  }
});

module.exports = router;