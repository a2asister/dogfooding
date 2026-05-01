import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const messagesFile = path.join(dataDir, 'messages.json')
const rulesFile = path.join(dataDir, 'rules.json')
const statisticsFile = path.join(dataDir, 'statistics.json')

// 初始消息源名称映射
const sourceNames = {
  dingtalk: '钉钉',
  wechat_work: '企业微信',
  email: '邮件',
  ticket: '工单',
  customer_service: '客服消息'
}

// 优先级映射
const priorityNames = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低'
}

// 智能摘要生成函数
function generateSummary(message) {
  if (message.summary) return message.summary
  
  const sourceName = sourceNames[message.source] || message.source
  const contentPreview = message.content.substring(0, 80)
  
  if (message.source === 'email') {
    return `[${sourceName}] ${message.title} - ${contentPreview}...`
  } else if (message.source === 'ticket') {
    return `[${sourceName}] 工单 #${message.id.substring(0, 8)}: ${message.title}`
  } else if (message.source === 'customer_service') {
    return `[${sourceName}] 来自${message.sender}的咨询：${contentPreview.substring(0, 50)}...`
  }
  
  return `[${sourceName}] ${message.title}`
}

// 初始消息数据
const initialMessages = [
  {
    id: 'msg-001',
    source: 'dingtalk',
    sourceName: '钉钉',
    title: '新的审批通知',
    content: '您有一个请假申请需要审批，申请人：张三，请假天数：3天，请假时间：2024-05-10至2024-05-12。请及时处理，逾期将自动转交给上级审批。',
    summary: '[钉钉] 新的审批通知 - 您有一个请假申请需要审批，申请人：张三，请假天数：3天...',
    priority: 'high',
    status: 'unread',
    tags: ['审批', '待处理'],
    sender: '人事部',
    receiver: '管理员',
    createdAt: '2024-05-01T09:30:00Z',
    updatedAt: '2024-05-01T09:30:00Z'
  },
  {
    id: 'msg-002',
    source: 'wechat_work',
    sourceName: '企业微信',
    title: '客户咨询',
    content: '客户李明咨询产品价格和交付周期问题，请尽快回复。客户联系方式：13800138000，邮箱：liming@example.com。客户意向较高，建议在24小时内回复。',
    summary: '[企业微信] 来自销售部-李明的咨询：客户李明咨询产品价格和交付周期问题...',
    priority: 'urgent',
    status: 'unread',
    tags: ['客户', '紧急'],
    sender: '销售部-李明',
    receiver: '管理员',
    createdAt: '2024-05-01T09:15:00Z',
    updatedAt: '2024-05-01T09:15:00Z'
  },
  {
    id: 'msg-003',
    source: 'email',
    sourceName: '邮件',
    title: '订单确认邮件',
    content: '您的订单 #2024001 已确认，金额：￥15,800，预计发货时间：3个工作日内。订单详情：商品A x 2，商品B x 1。收货地址：北京市朝阳区xxx街道xxx号。如有问题请联系客服。',
    summary: '[邮件] 订单确认邮件 - 您的订单 #2024001 已确认，金额：￥15,800...',
    priority: 'medium',
    status: 'read',
    tags: ['订单', '已确认'],
    sender: '系统通知',
    receiver: '管理员',
    createdAt: '2024-05-01T08:00:00Z',
    updatedAt: '2024-05-01T08:30:00Z'
  },
  {
    id: 'msg-004',
    source: 'ticket',
    sourceName: '工单',
    title: '新工单：系统登录异常',
    content: '用户反馈无法登录系统，错误提示：账号密码错误，但确认密码正确。用户信息：账号user001，姓名张三，部门技术部。问题描述：昨天还能正常登录，今天早上突然无法登录，尝试重置密码后仍然无法登录。',
    summary: '[工单] 工单 #msg-004: 新工单：系统登录异常',
    priority: 'urgent',
    status: 'unread',
    tags: ['技术问题', '紧急', '高优先级'],
    sender: '用户-张三',
    receiver: '管理员',
    createdAt: '2024-05-01T07:45:00Z',
    updatedAt: '2024-05-01T07:45:00Z'
  },
  {
    id: 'msg-005',
    source: 'customer_service',
    sourceName: '客服消息',
    title: '投诉处理提醒',
    content: '客户投诉订单延迟发货，需要尽快跟进处理并给出解决方案。客户信息：姓名李四，订单号ORD20240428，购买金额￥8,500。投诉内容：承诺48小时发货，但已过去5天仍未发货，客户要求退款并赔偿。',
    summary: '[客服消息] 来自访客001的咨询：客户投诉订单延迟发货，需要尽快跟进处理...',
    priority: 'urgent',
    status: 'unread',
    tags: ['投诉', '紧急'],
    sender: '访客001',
    receiver: '管理员',
    createdAt: '2024-05-01T07:30:00Z',
    updatedAt: '2024-05-01T07:30:00Z'
  },
  {
    id: 'msg-006',
    source: 'dingtalk',
    sourceName: '钉钉',
    title: '部门群消息',
    content: '下午3点会议室A召开项目周会，请准时参加。会议议程：1. 上周工作回顾 2. 本周工作计划 3. 问题与风险讨论 4. 其他事项。请提前准备好相关材料。',
    summary: '[钉钉] 部门群消息 - 下午3点会议室A召开项目周会，请准时参加...',
    priority: 'low',
    status: 'read',
    tags: ['会议通知'],
    sender: '技术部',
    receiver: '管理员',
    createdAt: '2024-05-01T07:00:00Z',
    updatedAt: '2024-05-01T07:15:00Z'
  },
  {
    id: 'msg-007',
    source: 'email',
    sourceName: '邮件',
    title: '系统维护通知',
    content: '尊敬的用户，系统将于本周六凌晨2点进行例行维护，预计持续2小时。维护期间系统将暂停服务，给您带来的不便敬请谅解。维护内容：1. 安全补丁更新 2. 性能优化 3. 功能改进。如有紧急事务请联系技术支持：13900139000。',
    summary: '[邮件] 系统维护通知 - 尊敬的用户，系统将于本周六凌晨2点进行例行维护...',
    priority: 'medium',
    status: 'unread',
    tags: ['系统通知'],
    sender: '系统通知',
    receiver: '管理员',
    createdAt: '2024-04-30T18:00:00Z',
    updatedAt: '2024-04-30T18:00:00Z'
  },
  {
    id: 'msg-008',
    source: 'wechat_work',
    sourceName: '企业微信',
    title: '日报提醒',
    content: '今日工作日报未提交，请在18:00前完成提交。日报内容要求：1. 今日完成工作 2. 明日计划 3. 遇到的问题。未按时提交将影响月度考核评分。',
    summary: '[企业微信] 来自客服部-王芳的咨询：今日工作日报未提交，请在18:00前完成提交...',
    priority: 'low',
    status: 'unread',
    tags: ['日常提醒'],
    sender: '客服部-王芳',
    receiver: '管理员',
    createdAt: '2024-04-30T16:00:00Z',
    updatedAt: '2024-04-30T16:00:00Z'
  }
]

// 初始规则数据
const initialRules = [
  {
    id: 'rule-001',
    name: '紧急消息自动标记',
    description: '将包含"紧急"、"投诉"、"异常"等关键词的消息自动标记为高优先级',
    conditions: {
      keywords: ['紧急', '投诉', '异常', '无法登录', '错误'],
      sources: ['ticket', 'customer_service', 'wechat_work']
    },
    actions: {
      setPriority: 'urgent',
      addTags: ['紧急', '高优先级'],
      notify: true
    },
    enabled: true,
    order: 1,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z'
  },
  {
    id: 'rule-002',
    name: '客户消息分流',
    description: '将来自客户的消息自动标记"客户"标签',
    conditions: {
      sources: ['customer_service', 'wechat_work'],
      keywords: ['客户', '咨询', '订单']
    },
    actions: {
      addTags: ['客户', '待跟进'],
      assignTo: '销售部门'
    },
    enabled: true,
    order: 2,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z'
  },
  {
    id: 'rule-003',
    name: '工单自动处理',
    description: '工单消息自动标记"技术问题"标签',
    conditions: {
      sources: ['ticket']
    },
    actions: {
      addTags: ['技术问题', '待处理'],
      setPriority: 'high'
    },
    enabled: true,
    order: 3,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z'
  }
]

// 初始统计数据
const initialStatistics = {
  total: 8,
  unread: 5,
  urgent: 3,
  bySource: {
    dingtalk: 2,
    wechat_work: 2,
    email: 2,
    ticket: 1,
    customer_service: 1
  },
  byPriority: {
    urgent: 3,
    high: 1,
    medium: 2,
    low: 2
  },
  byStatus: {
    unread: 5,
    read: 3,
    processing: 0,
    resolved: 0
  }
}

// 数据存储操作
const dataStore = {
  loadMessages() {
    if (fs.existsSync(messagesFile)) {
      try {
        const data = fs.readFileSync(messagesFile, 'utf-8')
        return JSON.parse(data)
      } catch (e) {
          console.error('加载消息数据失败:', e)
          return initialMessages
        }
    }
    return initialMessages
  },
  
  saveMessages() {
    try {
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8')
    } catch (e) {
      console.error('保存消息数据失败:', e)
    }
  },
  
  loadRules() {
    if (fs.existsSync(rulesFile)) {
      try {
        const data = fs.readFileSync(rulesFile, 'utf-8')
        return JSON.parse(data)
      } catch (e) {
        console.error('加载规则数据失败:', e)
        return initialRules
      }
    }
    return initialRules
  },
  
  saveRules() {
    try {
      fs.writeFileSync(rulesFile, JSON.stringify(rules, null, 2), 'utf-8')
    } catch (e) {
      console.error('保存规则数据失败:', e)
    }
  },
  
  loadStatistics() {
    if (fs.existsSync(statisticsFile)) {
      try {
        const data = fs.readFileSync(statisticsFile, 'utf-8')
        return JSON.parse(data)
      } catch (e) {
        console.error('加载统计数据失败:', e)
        return initialStatistics
      }
    }
    return initialStatistics
  },
  
  saveStatistics() {
    try {
      fs.writeFileSync(statisticsFile, JSON.stringify(statistics, null, 2), 'utf-8')
    } catch (e) {
      console.error('保存统计数据失败:', e)
    }
  }
}

// 加载数据
const messages = dataStore.loadMessages()
const rules = dataStore.loadRules()
const statistics = dataStore.loadStatistics()

// 如果是第一次运行，初始化数据文件
if (!fs.existsSync(messagesFile)) {
  dataStore.saveMessages()
}
if (!fs.existsSync(rulesFile)) {
  dataStore.saveRules()
}
if (!fs.existsSync(statisticsFile)) {
  dataStore.saveStatistics()
}

export {
  messages,
  rules,
  statistics,
  dataStore,
  sourceNames,
  priorityNames,
  generateSummary
}
