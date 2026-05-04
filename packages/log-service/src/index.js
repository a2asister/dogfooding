import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3005

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/logs.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { logs: [], total: 0 }
  }
}

const writeDatabase = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('写入数据库失败:', error)
    return false
  }
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '日志服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/logs', (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      userId, 
      username, 
      action, 
      module, 
      status, 
      startTime,
      endTime,
      keyword
    } = req.query
    const db = readDatabase()
    let logs = [...db.logs]

    if (userId) {
      logs = logs.filter(l => l.userId === userId)
    }

    if (username) {
      logs = logs.filter(l => l.username.includes(username))
    }

    if (action) {
      logs = logs.filter(l => l.action === action)
    }

    if (module) {
      logs = logs.filter(l => l.module === module)
    }

    if (status) {
      logs = logs.filter(l => l.status === status)
    }

    if (startTime) {
      logs = logs.filter(l => new Date(l.createdAt) >= new Date(startTime))
    }

    if (endTime) {
      logs = logs.filter(l => new Date(l.createdAt) <= new Date(endTime))
    }

    if (keyword) {
      logs = logs.filter(l =>
        l.description.includes(keyword) ||
        l.username.includes(keyword) ||
        l.action.includes(keyword)
      )
    }

    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = logs.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedLogs = logs.slice(start, end)

    const statistics = {
      total: db.logs.length,
      success: db.logs.filter(l => l.status === 'success').length,
      failed: db.logs.filter(l => l.status === 'failed').length,
      today: db.logs.filter(l => dayjs(l.createdAt).isSame(dayjs(), 'day')).length
    }

    res.json({
      success: true,
      data: paginatedLogs,
      statistics,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取日志列表失败', error: error.message })
  }
})

app.get('/api/logs/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const log = db.logs.find(l => l.id === id)

    if (!log) {
      return res.status(404).json({ success: false, message: '日志不存在' })
    }

    let parsedRequestData = null
    let parsedResponseData = null

    try {
      if (log.requestData) {
        parsedRequestData = JSON.parse(log.requestData)
      }
    } catch (e) {
      parsedRequestData = log.requestData
    }

    try {
      if (log.responseData) {
        parsedResponseData = JSON.parse(log.responseData)
      }
    } catch (e) {
      parsedResponseData = log.responseData
    }

    const result = {
      ...log,
      requestDataParsed: parsedRequestData,
      responseDataParsed: parsedResponseData
    }

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取日志详情失败', error: error.message })
  }
})

app.post('/api/logs', (req, res) => {
  try {
    const { userId, username, action, module, description, ip, userAgent, requestData, responseData, status, duration } = req.body

    const db = readDatabase()

    const newLog = {
      id: `l${Date.now().toString().slice(-3)}`,
      userId: userId || null,
      username: username || 'system',
      action: action || 'unknown',
      module: module || 'system',
      description: description || '',
      ip: ip || null,
      userAgent: userAgent || null,
      requestData: requestData ? JSON.stringify(requestData) : null,
      responseData: responseData ? JSON.stringify(responseData) : null,
      status: status || 'success',
      duration: duration || 0,
      createdAt: new Date().toISOString()
    }

    db.logs.unshift(newLog)
    db.total = db.logs.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newLog, message: '日志记录成功' })
    } else {
      res.status(500).json({ success: false, message: '日志记录失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '记录日志失败', error: error.message })
  }
})

app.get('/api/logs/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const logs = db.logs

    const moduleStats = {}
    const actionStats = {}
    const statusStats = { success: 0, failed: 0 }

    logs.forEach(log => {
      if (!moduleStats[log.module]) {
        moduleStats[log.module] = { count: 0, success: 0, failed: 0 }
      }
      moduleStats[log.module].count++
      if (log.status === 'success') moduleStats[log.module].success++
      else moduleStats[log.module].failed++

      if (!actionStats[log.action]) {
        actionStats[log.action] = 0
      }
      actionStats[log.action]++

      if (log.status === 'success') statusStats.success++
      else statusStats.failed++
    })

    const avgDuration = logs.length > 0 
      ? Math.round(logs.reduce((sum, log) => sum + (log.duration || 0), 0) / logs.length)
      : 0

    res.json({
      success: true,
      data: {
        total: logs.length,
        ...statusStats,
        moduleStats,
        actionStats: Object.entries(actionStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        avgDuration,
        today: logs.filter(l => dayjs(l.createdAt).isSame(dayjs(), 'day')).length,
        thisWeek: logs.filter(l => dayjs(l.createdAt).isSame(dayjs(), 'week')).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`日志服务运行在 http://localhost:${PORT}`)
})
