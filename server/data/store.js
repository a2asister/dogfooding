import { v4 as uuidv4 } from 'uuid'

const initialContents = [
  {
    id: '1',
    title: '人工智能发展趋势分析',
    content: '<p>人工智能正在快速发展...</p><h2>核心技术</h2><p>深度学习、自然语言处理...</p>',
    author: '张三',
    category: '科技',
    tags: ['AI', '科技', '趋势'],
    status: 'published',
    qualityScore: 85,
    trafficWeight: 1.2,
    createdAt: Date.now() - 86400000 * 3,
    publishedAt: Date.now() - 86400000 * 2,
    engagement: { views: 15200, likes: 2340, comments: 456, shares: 189 },
    monetization: { clicks: 890, revenue: 1250.5, cpm: 3.2 }
  },
  {
    id: '2',
    title: '前端开发最佳实践指南',
    content: '<h1>前端开发指南</h1><p>本文将介绍现代前端开发的最佳实践...</p><blockquote>代码即艺术</blockquote>',
    author: '李四',
    category: '技术',
    tags: ['前端', '开发', '最佳实践'],
    status: 'published',
    qualityScore: 92,
    trafficWeight: 1.8,
    createdAt: Date.now() - 86400000 * 7,
    publishedAt: Date.now() - 86400000 * 6,
    engagement: { views: 45000, likes: 8900, comments: 1200, shares: 780 },
    monetization: { clicks: 3200, revenue: 4500.0, cpm: 4.5 }
  },
  {
    id: '3',
    title: '健康生活方式分享',
    content: '<p>保持健康的生活方式非常重要...</p><ul><li>规律作息</li><li>均衡饮食</li><li>适量运动</li></ul>',
    author: '王五',
    category: '生活',
    tags: ['健康', '生活', '养生'],
    status: 'published',
    qualityScore: 78,
    trafficWeight: 0.9,
    createdAt: Date.now() - 86400000 * 1,
    publishedAt: Date.now() - 86400000 * 0.5,
    engagement: { views: 3200, likes: 560, comments: 89, shares: 34 },
    monetization: { clicks: 180, revenue: 256.0, cpm: 2.1 }
  },
  {
    id: '4',
    title: '投资理财入门教程',
    content: '<h2>理财基础</h2><p>投资有风险，入市需谨慎...</p><table><tr><td>基金</td><td>中低风险</td></tr></table>',
    author: '赵六',
    category: '财经',
    tags: ['理财', '投资', '入门'],
    status: 'reviewing',
    qualityScore: null,
    trafficWeight: 1.0,
    createdAt: Date.now() - 3600000,
    engagement: { views: 0, likes: 0, comments: 0, shares: 0 },
    monetization: { clicks: 0, revenue: 0, cpm: 0 }
  },
  {
    id: '5',
    title: '低质量测试文章',
    content: '<p>这是一篇质量很低的测试文章...</p>',
    author: '测试用户',
    category: '测试',
    tags: ['测试'],
    status: 'published',
    qualityScore: 35,
    trafficWeight: 0.2,
    createdAt: Date.now() - 86400000 * 5,
    publishedAt: Date.now() - 86400000 * 4,
    engagement: { views: 120, likes: 5, comments: 2, shares: 0 },
    monetization: { clicks: 3, revenue: 5.5, cpm: 0.8 }
  }
]

const initialTrafficRules = [
  { id: '1', name: '基础权重规则', description: '所有新发布内容基础权重为1.0', active: true, createdAt: Date.now() },
  { id: '2', name: '高质量内容加权', description: '质量分80分以上权重+0.5', active: true, createdAt: Date.now() },
  { id: '3', name: '爆款内容加温', description: '24小时内10000+浏览量，权重翻倍', active: true, createdAt: Date.now() },
  { id: '4', name: '低质内容限流', description: '质量分40分以下权重降至0.2', active: true, createdAt: Date.now() },
  { id: '5', name: '长尾内容盘活', description: '发布7天以上优质内容推荐复活', active: true, createdAt: Date.now() }
]

const initialAuditLogs = [
  { id: '1', contentId: '1', action: '审核通过', reviewer: '系统', reason: '质量评估通过', createdAt: Date.now() - 86400000 * 2 },
  { id: '2', contentId: '2', action: '审核通过', reviewer: '系统', reason: '优质内容，自动通过', createdAt: Date.now() - 86400000 * 6 },
  { id: '3', contentId: '3', action: '审核通过', reviewer: '系统', reason: '正常内容', createdAt: Date.now() - 86400000 * 0.5 },
  { id: '4', contentId: '5', action: '限流处理', reviewer: '系统', reason: '质量分过低', createdAt: Date.now() - 86400000 * 3.5 }
]

export const store = {
  contents: [...initialContents],
  trafficRules: [...initialTrafficRules],
  auditLogs: [...initialAuditLogs],
  
  getContents() {
    return this.contents
  },
  
  getContentById(id) {
    return this.contents.find(c => c.id === id)
  },
  
  createContent(data) {
    const content = {
      id: uuidv4(),
      ...data,
      status: 'reviewing',
      qualityScore: null,
      trafficWeight: 1.0,
      createdAt: Date.now(),
      engagement: { views: 0, likes: 0, comments: 0, shares: 0 },
      monetization: { clicks: 0, revenue: 0, cpm: 0 }
    }
    this.contents.unshift(content)
    return content
  },
  
  updateContent(id, data) {
    const index = this.contents.findIndex(c => c.id === id)
    if (index !== -1) {
      this.contents[index] = { ...this.contents[index], ...data }
      return this.contents[index]
    }
    return null
  },
  
  deleteContent(id) {
    const index = this.contents.findIndex(c => c.id === id)
    if (index !== -1) {
      this.contents.splice(index, 1)
      return true
    }
    return false
  },
  
  reviewContent(id, action, reason, reviewer = '系统') {
    const content = this.getContentById(id)
    if (!content) return null
    
    const qualityScore = action === 'approve' ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 10
    let trafficWeight = 1.0
    
    if (action === 'approve') {
      if (qualityScore >= 80) trafficWeight = 1.5
      else if (qualityScore >= 60) trafficWeight = 1.0
      else trafficWeight = 0.6
      content.status = 'published'
      content.publishedAt = Date.now()
    } else if (action === 'reject') {
      content.status = 'rejected'
      trafficWeight = 0
    } else if (action === 'restrict') {
      content.status = 'published'
      trafficWeight = 0.3
    }
    
    content.qualityScore = qualityScore
    content.trafficWeight = trafficWeight
    
    this.auditLogs.unshift({
      id: uuidv4(),
      contentId: id,
      action: action === 'approve' ? '审核通过' : action === 'reject' ? '审核拒绝' : '限流处理',
      reviewer,
      reason,
      createdAt: Date.now()
    })
    
    return content
  },
  
  updateEngagement(id, type) {
    const content = this.getContentById(id)
    if (!content || content.status !== 'published') return null
    
    if (type === 'view') content.engagement.views++
    else if (type === 'like') content.engagement.likes++
    else if (type === 'comment') content.engagement.comments++
    else if (type === 'share') content.engagement.shares++
    
    this.recalculateTrafficWeight(id)
    return content
  },
  
  updateMonetization(id, revenue, clicks) {
    const content = this.getContentById(id)
    if (!content) return null
    
    content.monetization.revenue += revenue
    content.monetization.clicks += clicks
    content.monetization.cpm = content.engagement.views > 0 
      ? (content.monetization.revenue / content.engagement.views) * 1000 
      : 0
    
    return content
  },
  
  recalculateTrafficWeight(id) {
    const content = this.getContentById(id)
    if (!content || content.status !== 'published') return
    
    let weight = 1.0
    const qualityScore = content.qualityScore || 50
    const views = content.engagement.views
    const hoursSincePublish = content.publishedAt ? (Date.now() - content.publishedAt) / 3600000 : 24
    
    if (qualityScore >= 80) weight += 0.5
    else if (qualityScore >= 60) weight += 0.2
    else if (qualityScore < 40) weight = 0.2
    
    if (hoursSincePublish <= 24 && views >= 10000) weight *= 2
    else if (hoursSincePublish <= 24 && views >= 5000) weight *= 1.5
    
    if (hoursSincePublish > 168 && qualityScore >= 70 && views < 5000) {
      weight *= 1.3
    }
    
    content.trafficWeight = Math.max(0.1, weight)
  },
  
  getTrafficRules() {
    return this.trafficRules
  },
  
  toggleTrafficRule(id) {
    const rule = this.trafficRules.find(r => r.id === id)
    if (rule) {
      rule.active = !rule.active
      return rule
    }
    return null
  },
  
  addTrafficRule(name, description) {
    const rule = {
      id: uuidv4(),
      name,
      description,
      active: true,
      createdAt: Date.now()
    }
    this.trafficRules.unshift(rule)
    return rule
  },
  
  getAuditLogs() {
    return this.auditLogs
  },
  
  getStatistics() {
    const published = this.contents.filter(c => c.status === 'published')
    const reviewing = this.contents.filter(c => c.status === 'reviewing')
    const rejected = this.contents.filter(c => c.status === 'rejected')
    
    const totalViews = published.reduce((sum, c) => sum + c.engagement.views, 0)
    const totalLikes = published.reduce((sum, c) => sum + c.engagement.likes, 0)
    const totalComments = published.reduce((sum, c) => sum + c.engagement.comments, 0)
    const totalShares = published.reduce((sum, c) => sum + c.engagement.shares, 0)
    const totalRevenue = published.reduce((sum, c) => sum + c.monetization.revenue, 0)
    
    const highQuality = published.filter(c => (c.qualityScore || 0) >= 80).length
    const mediumQuality = published.filter(c => (c.qualityScore || 0) >= 60 && (c.qualityScore || 0) < 80).length
    const lowQuality = published.filter(c => (c.qualityScore || 0) < 60).length
    
    const viralContent = published.filter(c => {
      const hours = c.publishedAt ? (Date.now() - c.publishedAt) / 3600000 : 24
      return hours <= 24 && c.engagement.views >= 5000
    }).length
    
    const longTailContent = published.filter(c => {
      const hours = c.publishedAt ? (Date.now() - c.publishedAt) / 3600000 : 0
      return hours > 168 && (c.qualityScore || 0) >= 70 && c.engagement.views < 5000
    }).length
    
    return {
      overview: {
        total: this.contents.length,
        published: published.length,
        reviewing: reviewing.length,
        rejected: rejected.length
      },
      engagement: {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares
      },
      monetization: {
        totalRevenue: totalRevenue,
        avgCpm: published.length > 0 ? totalRevenue / (totalViews / 1000 || 1) : 0
      },
      quality: {
        high: highQuality,
        medium: mediumQuality,
        low: lowQuality
      },
      traffic: {
        viral: viralContent,
        longTail: longTailContent
      }
    }
  }
}
