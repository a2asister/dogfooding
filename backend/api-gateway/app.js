require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')
const logger = require('./logger')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 
           'http://localhost:8083', 'http://localhost:8084', 'http://localhost:8085',
           'http://localhost:8086', 'http://localhost:8087', 'http://localhost:8088',
           'http://localhost:8089'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim())
    }
  }
}))

const services = {
  products: {
    target: 'http://localhost:3001',
    path: '/api/products'
  },
  orders: {
    target: 'http://localhost:3002',
    path: '/api/orders'
  },
  refunds: {
    target: 'http://localhost:3003',
    path: '/api/refunds'
  },
  marketing: {
    target: 'http://localhost:3004',
    path: '/api/marketing'
  },
  members: {
    target: 'http://localhost:3005',
    path: '/api/members'
  },
  finance: {
    target: 'http://localhost:3006',
    path: '/api/finance'
  },
  logistics: {
    target: 'http://localhost:3007',
    path: '/api/logistics'
  },
  settings: {
    target: 'http://localhost:3008',
    path: '/api/settings'
  }
}

Object.keys(services).forEach(key => {
  const service = services[key]
  app.use(service.path, createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: {
      [`^${service.path}`]: ''
    },
    logProvider: () => logger,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${service.path}:`, err)
      res.status(503).json({
        code: 503,
        message: `${key}服务暂时不可用`,
        data: null
      })
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying request to ${service.target}${req.url}`)
    }
  }))
})

app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: 'API网关服务运行正常',
    data: {
      timestamp: new Date().toISOString(),
      services: Object.keys(services)
    }
  })
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
  logger.info(`API网关服务启动成功，端口: ${PORT}`)
  console.log(`API Gateway is running on http://localhost:${PORT}`)
})
