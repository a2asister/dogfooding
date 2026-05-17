import express from 'express'
import cors from 'cors'
import path from 'node:path'
import router from './routes'

const PORT = Number(process.env.PORT) || 23764
const app = express()

app.use(
  cors({
    origin: ['http://localhost:18342', 'http://127.0.0.1:18342'],
    credentials: true
  })
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api', router)

const clientDist = path.resolve('../client/dist')
app.use(express.static(clientDist))

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.info(`🚀 服务已启动`)
  console.info(`📍 端口: ${PORT}`)
  console.info(`🔗 访问: http://localhost:${PORT}`)
})
