const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs-extra')

const uploadRouter = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 48081

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 确保必要的目录存在
const uploadDir = path.join(__dirname, '../uploads')
const chunksDir = path.join(__dirname, '../chunks')
const dataDir = path.join(__dirname, '../data')

fs.ensureDirSync(uploadDir)
fs.ensureDirSync(chunksDir)
fs.ensureDirSync(dataDir)

// 路由
app.use('/api/upload', uploadRouter)

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误'
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  console.log(`上传文件目录: ${uploadDir}`)
  console.log(`分片临时目录: ${chunksDir}`)
  console.log(`数据存储目录: ${dataDir}`)
})
