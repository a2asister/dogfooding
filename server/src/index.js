import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { messages, rules, statistics, dataStore } from './data.js'

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(bodyParser())

// 消息相关接口
router.get('/api/messages', async (ctx) => {
  const { source, tag, priority, status, page = 1, pageSize = 20 } = ctx.query
  
  let filtered = [...messages]
  
  if (source) {
    filtered = filtered.filter(m => m.source === source)
  }
  if (tag) {
    filtered = filtered.filter(m => m.tags.includes(tag))
  }
  if (priority) {
    filtered = filtered.filter(m => m.priority === priority)
  }
  if (status) {
    filtered = filtered.filter(m => m.status === status)
  }
  
  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + parseInt(pageSize))
  
  ctx.body = {
    success: true,
    data: {
      items,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  }
})

router.get('/api/messages/:id', async (ctx) => {
  const message = messages.find(m => m.id === ctx.params.id)
  if (message) {
    ctx.body = { success: true, data: message }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '消息不存在' }
  }
})

router.put('/api/messages/:id/read', async (ctx) => {
  const message = messages.find(m => m.id === ctx.params.id)
  if (message) {
    message.status = 'read'
    dataStore.saveMessages()
    ctx.body = { success: true, data: message }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '消息不存在' }
  }
})

router.put('/api/messages/:id/tags', async (ctx) => {
  const message = messages.find(m => m.id === ctx.params.id)
  if (message) {
    message.tags = ctx.body.tags || []
    dataStore.saveMessages()
    ctx.body = { success: true, data: message }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '消息不存在' }
  }
})

router.put('/api/messages/:id/priority', async (ctx) => {
  const message = messages.find(m => m.id === ctx.params.id)
  if (message) {
    message.priority = ctx.body.priority
    dataStore.saveMessages()
    ctx.body = { success: true, data: message }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '消息不存在' }
  }
})

// 统计接口
router.get('/api/statistics', async (ctx) => {
  ctx.body = { success: true, data: statistics }
})

// 规则相关接口
router.get('/api/rules', async (ctx) => {
  ctx.body = { success: true, data: rules }
})

router.post('/api/rules', async (ctx) => {
  const { v4: uuidv4 } = await import('uuid')
  const newRule = {
    id: uuidv4(),
    ...ctx.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  rules.push(newRule)
  dataStore.saveRules()
  ctx.body = { success: true, data: newRule }
})

router.put('/api/rules/:id', async (ctx) => {
  const rule = rules.find(r => r.id === ctx.params.id)
  if (rule) {
    Object.assign(rule, ctx.body, { updatedAt: new Date().toISOString() })
    dataStore.saveRules()
    ctx.body = { success: true, data: rule }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '规则不存在' }
  }
})

router.delete('/api/rules/:id', async (ctx) => {
  const index = rules.findIndex(r => r.id === ctx.params.id)
  if (index !== -1) {
    rules.splice(index, 1)
    dataStore.saveRules()
    ctx.body = { success: true }
  } else {
    ctx.status = 404
    ctx.body = { success: false, error: '规则不存在' }
  }
})

// 模拟新消息推送（用于演示）
router.post('/api/messages/simulate', async (ctx) => {
  const { v4: uuidv4 } = await import('uuid')
  const sources = ['dingtalk', 'wechat_work', 'email', 'ticket', 'customer_service']
  const source = sources[Math.floor(Math.random() * sources.length)]
  const priorities = ['urgent', 'high', 'medium', 'low']
  const priority = priorities[Math.floor(Math.random() * priorities.length)]
  
  const mockMessages = {
    dingtalk: [
      { title: '新的审批通知', content: '您有一个请假申请需要审批，申请人：张三，请假天数：3天' },
      { title: '部门群消息', content: '下午3点会议室A召开项目周会，请准时参加' },
      { title: '任务提醒', content: '您分配的任务"系统优化"即将到期，请及时处理' }
    ],
    wechat_work: [
      { title: '客户咨询', content: '客户李明咨询产品价格和交付周期问题，请尽快回复' },
      { title: '日报提醒', content: '今日工作日报未提交，请在18:00前完成提交' },
      { title: '会议邀请', content: '王总邀请您参加明天上午10点的战略讨论会' }
    ],
    email: [
      { title: '订单确认邮件', content: '您的订单 #2024001 已确认，金额：￥15,800，预计发货时间：3个工作日内' },
      { title: '系统维护通知', content: '尊敬的用户，系统将于本周六凌晨2点进行例行维护，预计持续2小时' },
      { title: '发票已开具', content: '您申请的发票已开具并寄出，快递单号：SF1234567890' }
    ],
    ticket: [
      { title: '新工单：系统登录异常', content: '用户反馈无法登录系统，错误提示：账号密码错误，但确认密码正确，优先级：高' },
      { title: '工单回复提醒', content: '您跟进的工单 #TK-2024-0056 有新的回复，请及时查看' },
      { title: '工单超时提醒', content: '工单 #TK-2024-0042 即将超时，请优先处理' }
    ],
    customer_service: [
      { title: '在线客服：产品咨询', content: '访客咨询新产品功能和定价，已转接给销售部门' },
      { title: '投诉处理提醒', content: '客户投诉订单延迟发货，需要尽快跟进处理并给出解决方案' },
      { title: '售后服务请求', content: '客户申请退货退款，订单号：ORD20240501，原因：商品描述不符' }
    ]
  }
  
  const mock = mockMessages[source][Math.floor(Math.random() * mockMessages[source].length)]
  
  // 简单的智能摘要生成
  const summary = `来自${getSourceName(source)}的消息：${mock.title.substring(0, 20)}...`
  
  const newMessage = {
    id: uuidv4(),
    source,
    sourceName: getSourceName(source),
    title: mock.title,
    content: mock.content,
    summary,
    priority,
    status: 'unread',
    tags: [],
    sender: getRandomSender(source),
    receiver: '管理员',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  messages.unshift(newMessage)
  dataStore.saveMessages()
  
  // 更新统计
  statistics.total += 1
  statistics.unread += 1
  if (priority === 'urgent') statistics.urgent += 1
  statistics.bySource[source] += 1
  dataStore.saveStatistics()
  
  ctx.body = { success: true, data: newMessage }
})

function getSourceName(source) {
  const names = {
    dingtalk: '钉钉',
    wechat_work: '企业微信',
    email: '邮件',
    ticket: '工单',
    customer_service: '客服消息'
  }
  return names[source] || source
}

function getRandomSender(source) {
  const senders = {
    dingtalk: ['人事部', '技术部', '项目组'],
    wechat_work: ['销售部-李明', '客服部-王芳', '技术支持'],
    email: ['系统通知', '客户服务', '财务部门'],
    ticket: ['用户-张三', '用户-李四', '用户-王五'],
    customer_service: ['访客001', '客户-赵六', '访客008']
  }
  const list = senders[source] || ['未知']
  return list[Math.floor(Math.random() * list.length)]
}

app.use(router.routes())
app.use(router.allowedMethods())

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`消息聚合中台服务运行在 http://localhost:${PORT}`)
})
