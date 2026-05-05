const { v4: uuidv4 } = require('uuid')

const SERVICES = {
  docker: [
    'nginx-gateway',
    'redis-cache',
    'mysql-db',
    'mongo-db',
    'rabbitmq',
    'elasticsearch'
  ],
  k8s: [
    'api-gateway-pod',
    'user-service-pod',
    'order-service-pod',
    'payment-service-pod',
    'notification-pod'
  ],
  backend: [
    'api-gateway',
    'user-service',
    'order-service',
    'payment-service',
    'notification-service',
    'auth-service'
  ],
  frontend: [
    'web-app',
    'admin-dashboard',
    'mobile-h5'
  ],
  miniprogram: [
    'mini-program-app',
    'mini-program-shop'
  ]
}

const LOG_MESSAGES = {
  docker: {
    info: [
      'Container started successfully',
      'Health check passed',
      'Config loaded from /etc/config.json',
      'Connection established with upstream server',
      'Cache hit for key: user:session:12345',
      'Image pulled successfully from registry',
      'Volume mounted successfully',
      'Network bridge configured',
      'Environment variables loaded',
      'Log rotation completed'
    ],
    warn: [
      'High memory usage detected: 85%',
      'Slow response time: > 500ms',
      'Connection pool nearly full',
      'DNS resolution took longer than expected',
      'Deprecated API endpoint accessed',
      'SSL certificate will expire in 30 days',
      'Rate limit approaching threshold',
      'Disk usage exceeds warning threshold'
    ],
    error: [
      'Connection refused to database server',
      'Out of memory error - OOM killer invoked',
      'Failed to pull image: image not found',
      'Container health check failed',
      'Network timeout connecting to external service',
      'Permission denied when accessing volume',
      'Configuration file syntax error',
      'Port already in use by another container'
    ]
  },
  k8s: {
    info: [
      'Pod scheduled successfully on node worker-01',
      'ConfigMap mounted to container',
      'Secret injected successfully',
      'Service endpoint discovered',
      'Ingress rule applied',
      'Horizontal pod autoscaling updated',
      'Node label updated',
      'Namespace created',
      'Deployment rolled out successfully',
      'StatefulSet ready: 3/3 replicas'
    ],
    warn: [
      'Pod restart count: 5 in last hour',
      'Node resource pressure detected',
      'Pending pod: insufficient CPU resources',
      'ImagePullBackOff: retrying in 5 minutes',
      'Liveness probe failed - restarting container',
      'Readiness probe failing intermittently',
      'High CPU throttling on container',
      'Eviction threshold approaching on node'
    ],
    error: [
      'Pod crashLoopBackOff: container keeps failing',
      'Failed to schedule pod: no nodes available',
      'Secret not found: db-credentials',
      'ConfigMap not found: app-config',
      'PersistentVolumeClaim binding failed',
      'Node not ready: network unreachable',
      'Deployment rollback triggered',
      'Service endpoint not reachable'
    ]
  },
  backend: {
    info: [
      'Request processed successfully in 45ms',
      'User authenticated: user@example.com',
      'Database query executed: SELECT * FROM users',
      'Cache invalidated for key: product:123',
      'Event published to message queue',
      'API rate limit check passed',
      'Token validated successfully',
      'Transaction committed successfully',
      'Health check passed: all services healthy',
      'Background job completed successfully'
    ],
    warn: [
      'Slow database query: > 2000ms',
      'Request timeout approaching: 90% of limit used',
      'Session nearly expired for user',
      'Retry attempt #2 for external API call',
      'Circuit breaker in half-open state',
      'Memory usage above warning threshold',
      'Thread pool utilization: 85%',
      'Duplicate request detected, ignoring'
    ],
    error: [
      'NullPointerException at UserService.validate()',
      'Database connection pool exhausted',
      'HTTP 500 Internal Server Error',
      'Failed to connect to Redis server',
      'JWT token signature verification failed',
      'Transaction rollback due to deadlock',
      'Rate limit exceeded for API endpoint',
      'Service unavailable: dependency service down'
    ]
  },
  frontend: {
    info: [
      'Page loaded successfully',
      'Component mounted: Dashboard',
      'API call completed: GET /api/users',
      'User interaction tracked: button_click',
      'State updated: userProfile',
      'Route navigation: /dashboard -> /orders',
      'Form validation passed',
      'LocalStorage read completed',
      'WebSocket connection established',
      'Image lazy loaded successfully'
    ],
    warn: [
      'Slow network detected: < 3G',
      'Large bundle size warning',
      'Memory leak suspected in component',
      'Long task blocking main thread',
      'Deprecation warning for API usage',
      'Resource preload failed',
      'Third-party script load timeout',
      'Performance metrics below threshold'
    ],
    error: [
      'JavaScript runtime error: Cannot read property of undefined',
      'API call failed: Network Error',
      'Promise rejection: unhandled exception',
      'CORS policy blocked request',
      'Invalid JSON response from server',
      'Authentication token expired',
      'Component render error',
      'WebSocket connection closed unexpectedly'
    ]
  },
  miniprogram: {
    info: [
      '小程序启动成功',
      '页面渲染完成: pages/home/index',
      '微信登录授权成功',
      '获取用户信息成功',
      '云函数调用成功: getOrders',
      '模板消息发送成功',
      '小程序码生成成功',
      '地理位置获取成功',
      '支付参数获取成功',
      '小程序更新检测完成'
    ],
    warn: [
      '网络请求超时警告',
      '本地存储接近上限',
      '页面渲染性能低于预期',
      '用户授权被拒绝',
      '云函数冷启动延迟',
      '接口调用频率接近限制',
      '小程序版本过低警告',
      '系统内存不足警告'
    ],
    error: [
      '微信登录失败: code无效',
      '云函数调用失败: 函数不存在',
      '支付签名验证失败',
      '模板消息发送失败: formId过期',
      '地理位置获取失败: 用户拒绝',
      '小程序码生成失败: 参数错误',
      '接口调用超过频率限制',
      '本地存储写入失败: 空间不足'
    ]
  }
}

const TAGS = {
  docker: {
    common: ['container', 'docker', 'runtime'],
    specific: ['memory', 'cpu', 'network', 'storage', 'image', 'volume']
  },
  k8s: {
    common: ['kubernetes', 'pod', 'node', 'namespace'],
    specific: ['deployment', 'service', 'configmap', 'secret', 'ingress', 'pvc']
  },
  backend: {
    common: ['api', 'request', 'response'],
    specific: ['database', 'cache', 'queue', 'auth', 'transaction', 'validation']
  },
  frontend: {
    common: ['web', 'browser', 'page'],
    specific: ['component', 'state', 'router', 'api-call', 'render', 'interaction']
  },
  miniprogram: {
    common: ['wechat', 'miniprogram', 'wx'],
    specific: ['cloud', 'login', 'payment', 'template', 'geolocation', 'qrcode']
  }
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

function randomTimestamp(hoursBack = 24) {
  const now = Date.now()
  const offset = Math.floor(Math.random() * hoursBack * 3600 * 1000)
  return now - offset
}

function generateLog(type, options = {}) {
  const {
    service,
    level,
    message,
    timestamp,
    includeSensitive = false,
    traceId
  } = options

  const selectedService = service || randomChoice(SERVICES[type])
  const selectedLevel = level || (() => {
    const rand = Math.random()
    if (rand < 0.6) return 'INFO'
    if (rand < 0.85) return 'WARN'
    return 'ERROR'
  })()

  const levelKey = selectedLevel === 'ERROR' ? 'error' : 
                    selectedLevel === 'WARN' ? 'warn' : 'info'
  
  const selectedMessage = message || randomChoice(LOG_MESSAGES[type][levelKey])

  const tags = {
    environment: randomChoice(['production', 'staging', 'development']),
    version: `v${randomInt(1, 3)}.${randomInt(0, 10)}.${randomInt(0, 100)}`,
    instance: `instance-${randomInt(1, 5)}`,
    ...Object.fromEntries(
      randomChoice(TAGS[type].common).split(',').map(t => [t, randomInt(1, 100)])
    ),
    [randomChoice(TAGS[type].specific)]: true
  }

  const log = {
    timestamp: timestamp || randomTimestamp(24),
    level: selectedLevel,
    message: selectedMessage,
    service: selectedService,
    type: type,
    traceId: traceId || (Math.random() > 0.3 ? uuidv4() : null),
    spanId: Math.random() > 0.5 ? uuidv4().substring(0, 16) : null,
    tags: tags,
    duration: selectedLevel === 'ERROR' ? null : randomInt(10, 5000),
    httpStatus: selectedLevel === 'ERROR' ? randomChoice([400, 401, 403, 404, 500, 502, 503]) : 
               randomChoice([200, 201, 204, 301, 302])
  }

  if (includeSensitive && (type === 'backend' || type === 'frontend')) {
    log.sensitiveData = {
      phone: `138${randomInt(1000, 9999)}${randomInt(1000, 9999)}`,
      email: `user${randomInt(1, 1000)}@example.com`,
      idCard: `1101011990${String(randomInt(1, 12)).padStart(2, '0')}${String(randomInt(1, 28)).padStart(2, '0')}${randomInt(1000, 9999)}`,
      password: `Passw0rd${randomInt(1, 100)}!`,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${uuidv4()}`
    }
  }

  if (selectedLevel === 'ERROR') {
    log.stack = `Error: ${selectedMessage}
    at ${selectedService}.${randomChoice(['handleRequest', 'processData', 'validateInput', 'executeQuery', 'sendNotification'])} (${selectedService}.js:${randomInt(1, 500)}:${randomInt(1, 100)})
    at ${randomChoice(['express', 'koa', 'next'])} (${randomChoice(['node_modules', 'lib'])}/index.js:${randomInt(1, 200)}:${randomInt(1, 50)})
    at process._tickCallback (internal/process/next_tick.js:68:7)`
  }

  return log
}

function generateLogs(type, count = 10, options = {}) {
  const logs = []
  for (let i = 0; i < count; i++) {
    logs.push(generateLog(type, {
      ...options,
      timestamp: Date.now() - (count - i) * randomInt(100, 5000)
    }))
  }
  return logs
}

function generateAllTypesLogs(countPerType = 50) {
  const allLogs = []
  const types = ['docker', 'k8s', 'backend', 'frontend', 'miniprogram']
  
  types.forEach(type => {
    const logs = generateLogs(type, countPerType, {
      includeSensitive: type === 'backend' || type === 'frontend'
    })
    allLogs.push(...logs)
  })
  
  return allLogs.sort((a, b) => a.timestamp - b.timestamp)
}

function generateTraceLogs(traceId, services, options = {}) {
  const {
    operation = 'API Request',
    hasError = false,
    startTimestamp = Date.now()
  } = options

  const logs = []
  let currentTimestamp = startTimestamp

  for (let i = 0; i < services.length; i++) {
    const service = services[i]
    const isLast = i === services.length - 1
    const isErrorService = hasError && i === Math.floor(services.length / 2)

    const duration = randomInt(50, 500)
    const level = isErrorService ? 'ERROR' : 'INFO'
    
    logs.push({
      timestamp: currentTimestamp,
      level: level,
      message: isErrorService 
        ? `Failed to ${operation.toLowerCase()} - Connection timeout`
        : `${service} processing ${operation}`,
      service: service,
      type: 'backend',
      traceId: traceId,
      spanId: uuidv4().substring(0, 16),
      tags: {
        phase: i === 0 ? 'start' : isLast ? 'end' : 'middle',
        step: i + 1
      },
      duration: duration
    })

    if (isErrorService) {
      logs.push({
        timestamp: currentTimestamp + 10,
        level: 'ERROR',
        message: `Exception: Connection timeout to external service`,
        service: service,
        type: 'backend',
        traceId: traceId,
        spanId: uuidv4().substring(0, 16),
        stack: `Error: Connection timeout
    at ${service}.callExternalService (${service}.js:123:45)
    at ${service}.processRequest (${service}.js:89:21)`,
        tags: { errorType: 'timeout' }
      })
    }

    currentTimestamp += duration
  }

  return logs
}

function generateSampleAlertRule() {
  return {
    name: 'High Error Rate',
    description: 'Alert when error rate exceeds 10% in 5 minutes',
    condition: 'error_rate_gt',
    level: 'ERROR',
    service: null,
    keyword: null,
    threshold: 10,
    timeWindow: 300000,
    severity: 'HIGH',
    enabled: true
  }
}

module.exports = {
  generateLog,
  generateLogs,
  generateAllTypesLogs,
  generateTraceLogs,
  generateSampleAlertRule,
  SERVICES,
  LOG_MESSAGES,
  randomChoice,
  randomInt,
  randomTimestamp
}
