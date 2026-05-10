import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import contentsRouter from './routes/contents.js'
import trafficRouter from './routes/traffic.js'

const app = new Koa()
const router = new Router()

app.use(bodyParser())

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type')
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
    return
  }
  await next()
})

router.get('/api/health', (ctx) => {
  ctx.body = { success: true, message: '服务正常运行', timestamp: Date.now() }
})

app.use(router.routes())
app.use(contentsRouter.routes())
app.use(trafficRouter.routes())
app.use(router.allowedMethods())

const PORT = 4000

app.listen(PORT, () => {
  console.log(`内容生态流量流转系统后端服务已启动`)
  console.log(`服务地址: http://localhost:${PORT}`)
  console.log(`健康检查: http://localhost:${PORT}/api/health`)
})
