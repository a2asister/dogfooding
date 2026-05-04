require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const logger = require('./logger')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const productsDataPath = path.join(__dirname, 'data', 'products.json')

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsDataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    logger.error('读取商品数据失败:', error)
    return []
  }
}

const writeProducts = (products) => {
  try {
    fs.writeFileSync(productsDataPath, JSON.stringify(products, null, 2), 'utf-8')
    return true
  } catch (error) {
    logger.error('写入商品数据失败:', error)
    return false
  }
}

app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '商品微服务运行正常',
    data: {
      service: 'product-service',
      timestamp: new Date().toISOString()
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '商品服务健康检查通过',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  })
})

app.get('/products', (req, res) => {
  try {
    let products = readProducts()
    const { page = 1, pageSize = 10, name, category, status } = req.query
    
    if (name) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(name.toLowerCase())
      )
    }
    if (category) {
      products = products.filter(p => p.category === category)
    }
    if (status) {
      products = products.filter(p => p.status === status)
    }

    const total = products.length
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedProducts = products.slice(startIndex, endIndex)

    res.json({
      code: 200,
      message: '获取商品列表成功',
      data: {
        list: paginatedProducts,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    })
  } catch (error) {
    logger.error('获取商品列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败',
      data: null
    })
  }
})

app.get('/products/:id', (req, res) => {
  try {
    const { id } = req.params
    const products = readProducts()
    const product = products.find(p => p.id === parseInt(id))
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      })
    }

    res.json({
      code: 200,
      message: '获取商品详情成功',
      data: product
    })
  } catch (error) {
    logger.error('获取商品详情失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败',
      data: null
    })
  }
})

app.post('/products', (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, status, image, description, specs } = req.body
    
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
        data: null
      })
    }

    const products = readProducts()
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name,
      category,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice) || parseFloat(price),
      stock: parseInt(stock) || 0,
      sales: 0,
      status: status || 'active',
      image: image || '',
      images: [],
      description: description || '',
      specs: specs || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    products.push(newProduct)
    const success = writeProducts(products)

    if (success) {
      logger.info(`商品创建成功: ${newProduct.name}`)
      res.json({
        code: 200,
        message: '商品创建成功',
        data: newProduct
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '商品创建失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('创建商品失败:', error)
    res.status(500).json({
      code: 500,
      message: '创建商品失败',
      data: null
    })
  }
})

app.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, category, price, originalPrice, stock, status, image, description, specs } = req.body
    
    const products = readProducts()
    const index = products.findIndex(p => p.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      })
    }

    const updatedProduct = {
      ...products[index],
      name: name !== undefined ? name : products[index].name,
      category: category !== undefined ? category : products[index].category,
      price: price !== undefined ? parseFloat(price) : products[index].price,
      originalPrice: originalPrice !== undefined ? parseFloat(originalPrice) : products[index].originalPrice,
      stock: stock !== undefined ? parseInt(stock) : products[index].stock,
      status: status !== undefined ? status : products[index].status,
      image: image !== undefined ? image : products[index].image,
      description: description !== undefined ? description : products[index].description,
      specs: specs !== undefined ? specs : products[index].specs,
      updatedAt: new Date().toISOString()
    }

    products[index] = updatedProduct
    const success = writeProducts(products)

    if (success) {
      logger.info(`商品更新成功: ${updatedProduct.name}`)
      res.json({
        code: 200,
        message: '商品更新成功',
        data: updatedProduct
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '商品更新失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('更新商品失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新商品失败',
      data: null
    })
  }
})

app.patch('/products/:id/status', (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status || !['active', 'inactive', 'soldout'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值',
        data: null
      })
    }

    const products = readProducts()
    const index = products.findIndex(p => p.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      })
    }

    products[index].status = status
    products[index].updatedAt = new Date().toISOString()

    const success = writeProducts(products)

    if (success) {
      logger.info(`商品状态更新成功: id=${id}, status=${status}`)
      res.json({
        code: 200,
        message: '商品状态更新成功',
        data: {
          id: parseInt(id),
          status
        }
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '商品状态更新失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('更新商品状态失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新商品状态失败',
      data: null
    })
  }
})

app.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params
    const products = readProducts()
    const index = products.findIndex(p => p.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在',
        data: null
      })
    }

    const deletedProduct = products.splice(index, 1)[0]
    const success = writeProducts(products)

    if (success) {
      logger.info(`商品删除成功: ${deletedProduct.name}`)
      res.json({
        code: 200,
        message: '商品删除成功',
        data: deletedProduct
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '商品删除失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('删除商品失败:', error)
    res.status(500).json({
      code: 500,
      message: '删除商品失败',
      data: null
    })
  }
})

app.get('/categories', (req, res) => {
  try {
    const categories = [
      { value: 'digital', label: '数码产品' },
      { value: 'clothing', label: '服装服饰' },
      { value: 'food', label: '食品饮料' },
      { value: 'home', label: '家居用品' },
      { value: 'beauty', label: '美妆个护' }
    ]

    res.json({
      code: 200,
      message: '获取商品分类成功',
      data: categories
    })
  } catch (error) {
    logger.error('获取商品分类失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品分类失败',
      data: null
    })
  }
})

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  })
})

app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '请求的资源不存在',
    data: null
  })
})

app.listen(PORT, () => {
  logger.info(`商品微服务启动成功，端口: ${PORT}`)
  console.log(`Product Service is running on http://localhost:${PORT}`)
})
