import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import logger, { koaLogger } from './middleware/logger.js'
import router from './routes/index.js'

const app = new Koa()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(bodyParser({
  jsonLimit: '10mb'
}))

app.use(koaLogger)

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    logger.error('Unhandled error', { 
      error: error.message, 
      stack: error.stack,
      url: ctx.url,
      method: ctx.method
    })
    ctx.status = error.status || 500
    ctx.body = {
      success: false,
      error: error.message || 'Internal Server Error'
    }
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = {
    success: false,
    error: 'Route not found'
  }
})

app.listen(PORT, () => {
  logger.info(`🚀 Baby Management Backend Server started on port ${PORT}`)
  logger.info(`📋 API endpoints: http://localhost:${PORT}/api/health`)
  logger.info(`🌐 CORS allowed origin: http://localhost:5173`)
})

app.on('error', (error) => {
  logger.error('Server error', { error: error.message, stack: error.stack })
})

export default app
