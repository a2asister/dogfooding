import Router from 'koa-router'
import { store } from '../data/store.js'

const router = new Router({ prefix: '/api/traffic' })

router.get('/rules', (ctx) => {
  ctx.body = { success: true, data: store.getTrafficRules() }
})

router.post('/rules', (ctx) => {
  const { name, description } = ctx.request.body
  if (!name || !description) {
    ctx.status = 400
    ctx.body = { success: false, message: '规则名称和描述不能为空' }
    return
  }
  
  const rule = store.addTrafficRule(name, description)
  ctx.body = { success: true, data: rule, message: '规则添加成功' }
})

router.post('/rules/:id/toggle', (ctx) => {
  const rule = store.toggleTrafficRule(ctx.params.id)
  if (rule) {
    ctx.body = { success: true, data: rule, message: rule.active ? '规则已启用' : '规则已禁用' }
  } else {
    ctx.status = 404
    ctx.body = { success: false, message: '规则不存在' }
  }
})

router.get('/logs', (ctx) => {
  ctx.body = { success: true, data: store.getAuditLogs() }
})

router.get('/statistics', (ctx) => {
  ctx.body = { success: true, data: store.getStatistics() }
})

export default router
