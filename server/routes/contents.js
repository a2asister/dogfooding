import Router from 'koa-router'
import { store } from '../data/store.js'

const router = new Router({ prefix: '/api/contents' })

router.get('/', (ctx) => {
  const { status, category, sort } = ctx.query
  let contents = store.getContents()
  
  if (status) {
    contents = contents.filter(c => c.status === status)
  }
  if (category) {
    contents = contents.filter(c => c.category === category)
  }
  
  if (sort === 'weight') {
    contents = [...contents].sort((a, b) => (b.trafficWeight || 0) - (a.trafficWeight || 0))
  } else if (sort === 'views') {
    contents = [...contents].sort((a, b) => b.engagement.views - a.engagement.views)
  } else if (sort === 'quality') {
    contents = [...contents].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
  } else if (sort === 'revenue') {
    contents = [...contents].sort((a, b) => b.monetization.revenue - a.monetization.revenue)
  }
  
  ctx.body = { success: true, data: contents }
})

router.get('/:id', (ctx) => {
  const content = store.getContentById(ctx.params.id)
  if (content) {
    ctx.body = { success: true, data: content }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在' }
  }
})

router.post('/', (ctx) => {
  const { title, content, author, category, tags } = ctx.request.body
  if (!title || !content) {
    ctx.status = 400
    ctx.body = { success: false, message: '标题和内容不能为空' }
    return
  }
  
  const newContent = store.createContent({
    title,
    content,
    author: author || '匿名用户',
    category: category || '其他',
    tags: tags || []
  })
  
  ctx.body = { success: true, data: newContent, message: '内容已提交审核' }
})

router.put('/:id', (ctx) => {
  const updated = store.updateContent(ctx.params.id, ctx.request.body)
  if (updated) {
    ctx.body = { success: true, data: updated }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在' }
  }
})

router.delete('/:id', (ctx) => {
  const deleted = store.deleteContent(ctx.params.id)
  if (deleted) {
    ctx.body = { success: true, message: '删除成功' }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在' }
  }
})

router.post('/:id/review', (ctx) => {
  const { action, reason, reviewer } = ctx.request.body
  if (!['approve', 'reject', 'restrict'].includes(action)) {
    ctx.status = 400
    ctx.body = { success: false, message: '无效的审核操作' }
    return
  }
  
  const result = store.reviewContent(ctx.params.id, action, reason || '', reviewer || '系统')
  if (result) {
    ctx.body = { success: true, data: result, message: action === 'approve' ? '审核通过' : action === 'reject' ? '审核拒绝' : '已限流' }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在' }
  }
})

router.post('/:id/engage', (ctx) => {
  const { type } = ctx.request.body
  if (!['view', 'like', 'comment', 'share'].includes(type)) {
    ctx.status = 400
    ctx.body = { success: false, message: '无效的互动类型' }
    return
  }
  
  const result = store.updateEngagement(ctx.params.id, type)
  if (result) {
    ctx.body = { success: true, data: result }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在或未发布' }
  }
})

router.post('/:id/monetize', (ctx) => {
  const { revenue, clicks } = ctx.request.body
  const result = store.updateMonetization(ctx.params.id, revenue || 0, clicks || 0)
  if (result) {
    ctx.body = { success: true, data: result }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '内容不存在' }
  }
})

export default router
