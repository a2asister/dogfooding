import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import koaLogger from 'koa-logger'
import Router from '@koa/router'
import dotenv from 'dotenv'
import errorHandler from './middleware/errorHandler.js'
import requestLogger from './middleware/requestLogger.js'
import authRouter from './routes/auth.js'
import giftsRouter from './routes/gifts.js'
import gamesRouter from './routes/games.js'
import adminRouter from './routes/admin.js'
import statisticsRouter from './routes/statistics.js'
import logger from './config/logger.js'

dotenv.config()

const app = new Koa()

app.use(helmet())

app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
)

app.use(
  bodyParser({
    jsonLimit: '10mb',
    formLimit: '10mb',
  })
)

if (process.env.NODE_ENV === 'development') {
  app.use(koaLogger())
}

app.use(errorHandler)
app.use(requestLogger)

const router = new Router()

router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  }
})

app.use(router.routes()).use(router.allowedMethods())
app.use(authRouter.routes()).use(authRouter.allowedMethods())
app.use(giftsRouter.routes()).use(giftsRouter.allowedMethods())
app.use(gamesRouter.routes()).use(gamesRouter.allowedMethods())
app.use(adminRouter.routes()).use(adminRouter.allowedMethods())
app.use(statisticsRouter.routes()).use(statisticsRouter.allowedMethods())

app.on('error', (err, ctx) => {
  logger.error('Application error', {
    message: err.message,
    stack: err.stack,
    path: ctx.path,
    method: ctx.method,
  })
})

export default app
