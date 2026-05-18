import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const uploadsDir = path.join(__dirname, '..', 'uploads')
const processedDir = path.join(__dirname, '..', 'processed')

app.use('/uploads', express.static(uploadsDir))
app.use('/processed', express.static(processedDir))

app.use('/api/uploads', express.static(uploadsDir))
app.use('/api/processed', express.static(processedDir))

app.use('/api', routes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📁 上传目录: ${path.join(__dirname, '..', 'uploads')}`)
  console.log(`📦 处理目录: ${path.join(__dirname, '..', 'processed')}`)
})

export default app
