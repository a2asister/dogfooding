import Koa from 'koa'
import { koaBody } from 'koa-body'
import cors from '@koa/cors'
import logger from './utils/logger'
import { httpLogger } from './utils/logger'
import { errorHandler } from './middleware/handler'
import router from './routes'
import { config } from './config'

const app = new Koa()

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024,
  },
}))

app.use(httpLogger)

app.use(errorHandler)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(config.port, () => {
  logger.info(`服务器运行在 http://localhost:${config.port}`)
  logger.info(`环境: ${config.nodeEnv}`)
})

export default app
