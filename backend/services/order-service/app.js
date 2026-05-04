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
const PORT = process.env.PORT || 3002

app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const ordersDataPath = path.join(__dirname, 'data', 'orders.json')

const readOrders = () => {
  try {
    const data = fs.readFileSync(ordersDataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    logger.error('读取订单数据失败:', error)
    return []
  }
}

const writeOrders = (orders) => {
  try {
    fs.writeFileSync(ordersDataPath, JSON.stringify(orders, null, 2), 'utf-8')
    return true
  } catch (error) {
    logger.error('写入订单数据失败:', error)
    return false
  }
}

const generateOrderNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString().slice(2, 8)
  return `ORD${year}${month}${day}${random}`
}

app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '订单微服务运行正常',
    data: {
      service: 'order-service',
      timestamp: new Date().toISOString()
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '订单服务健康检查通过',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  })
})

app.get('/orders', (req, res) => {
  try {
    let orders = readOrders()
    const { page = 1, pageSize = 10, orderNo, status, startDate, endDate } = req.query
    
    if (orderNo) {
      orders = orders.filter(o => 
        o.orderNo.toLowerCase().includes(orderNo.toLowerCase())
      )
    }
    if (status) {
      orders = orders.filter(o => o.status === status)
    }
    if (startDate && endDate) {
      orders = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return orderDate >= start && orderDate <= end
      })
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = orders.length
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedOrders = orders.slice(startIndex, endIndex)

    res.json({
      code: 200,
      message: '获取订单列表成功',
      data: {
        list: paginatedOrders,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    })
  } catch (error) {
    logger.error('获取订单列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败',
      data: null
    })
  }
})

app.get('/orders/:id', (req, res) => {
  try {
    const { id } = req.params
    const orders = readOrders()
    const order = orders.find(o => o.id === parseInt(id))
    
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      })
    }

    res.json({
      code: 200,
      message: '获取订单详情成功',
      data: order
    })
  } catch (error) {
    logger.error('获取订单详情失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败',
      data: null
    })
  }
})

app.post('/orders', (req, res) => {
  try {
    const { customerId, customerName, customerPhone, shippingAddress, products, 
            totalAmount, shippingFee, couponDiscount, payAmount, payMethod, remark } = req.body
    
    if (!products || products.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '订单商品不能为空',
        data: null
      })
    }

    const orders = readOrders()
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      orderNo: generateOrderNo(),
      customerId: customerId || null,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      shippingAddress: shippingAddress || '',
      products: products || [],
      totalAmount: parseFloat(totalAmount) || 0,
      shippingFee: parseFloat(shippingFee) || 0,
      couponDiscount: parseFloat(couponDiscount) || 0,
      payAmount: parseFloat(payAmount) || 0,
      payMethod: payMethod || null,
      payTime: null,
      status: 'pending_payment',
      logisticsCompany: '',
      logisticsNo: '',
      shipTime: null,
      deliveryTime: null,
      completeTime: null,
      cancelTime: null,
      cancelReason: null,
      remark: remark || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    orders.push(newOrder)
    const success = writeOrders(orders)

    if (success) {
      logger.info(`订单创建成功: ${newOrder.orderNo}`)
      res.json({
        code: 200,
        message: '订单创建成功',
        data: newOrder
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '订单创建失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('创建订单失败:', error)
    res.status(500).json({
      code: 500,
      message: '创建订单失败',
      data: null
    })
  }
})

app.patch('/orders/:id/ship', (req, res) => {
  try {
    const { id } = req.params
    const { logisticsCompany, logisticsNo } = req.body
    
    if (!logisticsCompany || !logisticsNo) {
      return res.status(400).json({
        code: 400,
        message: '物流公司和物流单号不能为空',
        data: null
      })
    }

    const orders = readOrders()
    const index = orders.findIndex(o => o.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      })
    }

    if (orders[index].status !== 'pending_shipment') {
      return res.status(400).json({
        code: 400,
        message: '只有待发货的订单才能发货',
        data: null
      })
    }

    orders[index].status = 'shipped'
    orders[index].logisticsCompany = logisticsCompany
    orders[index].logisticsNo = logisticsNo
    orders[index].shipTime = new Date().toISOString()
    orders[index].updatedAt = new Date().toISOString()

    const success = writeOrders(orders)

    if (success) {
      logger.info(`订单发货成功: orderId=${id}`)
      res.json({
        code: 200,
        message: '订单发货成功',
        data: {
          id: parseInt(id),
          status: 'shipped',
          logisticsCompany,
          logisticsNo
        }
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '订单发货失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('订单发货失败:', error)
    res.status(500).json({
      code: 500,
      message: '订单发货失败',
      data: null
    })
  }
})

app.patch('/orders/:id/cancel', (req, res) => {
  try {
    const { id } = req.params
    const { cancelReason } = req.body
    
    const orders = readOrders()
    const index = orders.findIndex(o => o.id === parseInt(id))
    
    if (index === -1) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      })
    }

    if (!['pending_payment', 'pending_shipment'].includes(orders[index].status)) {
      return res.status(400).json({
        code: 400,
        message: '该订单状态不能取消',
        data: null
      })
    }

    orders[index].status = 'cancelled'
    orders[index].cancelTime = new Date().toISOString()
    orders[index].cancelReason = cancelReason || '用户取消订单'
    orders[index].updatedAt = new Date().toISOString()

    const success = writeOrders(orders)

    if (success) {
      logger.info(`订单取消成功: orderId=${id}`)
      res.json({
        code: 200,
        message: '订单取消成功',
        data: {
          id: parseInt(id),
          status: 'cancelled'
        }
      })
    } else {
      res.status(500).json({
        code: 500,
        message: '订单取消失败',
        data: null
      })
    }
  } catch (error) {
    logger.error('订单取消失败:', error)
    res.status(500).json({
      code: 500,
      message: '订单取消失败',
      data: null
    })
  }
})

app.get('/statistics', (req, res) => {
  try {
    const orders = readOrders()
    const { startDate, endDate } = req.query
    
    let filteredOrders = orders
    if (startDate && endDate) {
      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return orderDate >= start && orderDate <= end
      })
    }

    const statistics = {
      totalOrders: filteredOrders.length,
      totalAmount: filteredOrders.reduce((sum, o) => sum + (o.payAmount || 0), 0),
      pendingPayment: filteredOrders.filter(o => o.status === 'pending_payment').length,
      pendingShipment: filteredOrders.filter(o => o.status === 'pending_shipment').length,
      shipped: filteredOrders.filter(o => o.status === 'shipped').length,
      completed: filteredOrders.filter(o => o.status === 'completed').length,
      cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
    }

    res.json({
      code: 200,
      message: '获取订单统计成功',
      data: statistics
    })
  } catch (error) {
    logger.error('获取订单统计失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取订单统计失败',
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
  logger.info(`订单微服务启动成功，端口: ${PORT}`)
  console.log(`Order Service is running on http://localhost:${PORT}`)
})
