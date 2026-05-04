import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3006

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/audits.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { audits: [], total: 0 }
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

const getRiskLevel = (type) => {
  const riskLevels = {
    batch_delete: 'high',
    config_change: 'medium',
    permission_change: 'medium',
    data_access: 'low',
    login: 'low'
  }
  return riskLevels[type] || 'low'
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '审计服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/audits', (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      status, 
      operatorId,
      operatorName,
      targetId,
      riskLevel,
      startTime,
      endTime,
      keyword
    } = req.query
    const db = readDatabase()
    let audits = [...db.audits]

    audits = audits.map(a => ({
      ...a,
      riskLevel: getRiskLevel(a.type)
    }))

    if (type) {
      audits = audits.filter(a => a.type === type)
    }

    if (status) {
      audits = audits.filter(a => a.status === status)
    }

    if (operatorId) {
      audits = audits.filter(a => a.operatorId === operatorId)
    }

    if (operatorName) {
      audits = audits.filter(a => a.operatorName.includes(operatorName))
    }

    if (targetId) {
      audits = audits.filter(a => a.targetId === targetId)
    }

    if (riskLevel) {
      audits = audits.filter(a => a.riskLevel === riskLevel)
    }

    if (startTime) {
      audits = audits.filter(a => new Date(a.createdAt) >= new Date(startTime))
    }

    if (endTime) {
      audits = audits.filter(a => new Date(a.createdAt) <= new Date(endTime))
    }

    if (keyword) {
      audits = audits.filter(a =>
        a.title.includes(keyword) ||
        a.operatorName.includes(keyword) ||
        a.changeDetails.includes(keyword)
      )
    }

    audits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = audits.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedAudits = audits.slice(start, end)

    const statistics = {
      total: db.audits.length,
      pending: db.audits.filter(a => a.status === 'pending').length,
      approved: db.audits.filter(a => a.status === 'approved').length,
      rejected: db.audits.filter(a => a.status === 'rejected').length,
      highRisk: db.audits.filter(a => getRiskLevel(a.type) === 'high').length,
      mediumRisk: db.audits.filter(a => getRiskLevel(a.type) === 'medium').length,
      lowRisk: db.audits.filter(a => getRiskLevel(a.type) === 'low').length
    }

    res.json({
      success: true,
      data: paginatedAudits,
      statistics,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取审计列表失败', error: error.message })
  }
})

app.get('/api/audits/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const audit = db.audits.find(a => a.id === id)

    if (!audit) {
      return res.status(404).json({ success: false, message: '审计记录不存在' })
    }

    let parsedBeforeData = null
    let parsedAfterData = null

    try {
      if (audit.beforeData) {
        parsedBeforeData = JSON.parse(audit.beforeData)
      }
    } catch (e) {
      parsedBeforeData = audit.beforeData
    }

    try {
      if (audit.afterData) {
        parsedAfterData = JSON.parse(audit.afterData)
      }
    } catch (e) {
      parsedAfterData = audit.afterData
    }

    const result = {
      ...audit,
      riskLevel: getRiskLevel(audit.type),
      beforeDataParsed: parsedBeforeData,
      afterDataParsed: parsedAfterData
    }

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取审计详情失败', error: error.message })
  }
})

app.post('/api/audits', (req, res) => {
  try {
    const { title, type, targetId, targetName, operatorId, operatorName, beforeData, afterData, changeDetails } = req.body

    if (!title || !type) {
      return res.status(400).json({ success: false, message: '标题和类型为必填项' })
    }

    const db = readDatabase()

    const newAudit = {
      id: `a${Date.now().toString().slice(-3)}`,
      title,
      type,
      targetId: targetId || null,
      targetName: targetName || '',
      operatorId: operatorId || null,
      operatorName: operatorName || 'system',
      beforeData: beforeData ? JSON.stringify(beforeData) : null,
      afterData: afterData ? JSON.stringify(afterData) : null,
      changeDetails: changeDetails || '',
      status: 'pending',
      auditorId: null,
      auditorName: null,
      auditComment: null,
      createdAt: new Date().toISOString(),
      auditedAt: null
    }

    db.audits.unshift(newAudit)
    db.total = db.audits.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: { ...newAudit, riskLevel: getRiskLevel(type) }, message: '审计记录创建成功' })
    } else {
      res.status(500).json({ success: false, message: '审计记录创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建审计记录失败', error: error.message })
  }
})

app.put('/api/audits/:id/audit', (req, res) => {
  try {
    const { id } = req.params
    const { status, auditorId, auditorName, auditComment } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的审计状态' })
    }

    const db = readDatabase()
    const auditIndex = db.audits.findIndex(a => a.id === id)

    if (auditIndex === -1) {
      return res.status(404).json({ success: false, message: '审计记录不存在' })
    }

    if (db.audits[auditIndex].status !== 'pending') {
      return res.status(400).json({ success: false, message: '该审计记录已处理' })
    }

    db.audits[auditIndex] = {
      ...db.audits[auditIndex],
      status,
      auditorId: auditorId || null,
      auditorName: auditorName || null,
      auditComment: auditComment || null,
      auditedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.audits[auditIndex], message: `审计${status === 'approved' ? '通过' : '拒绝'}` })
    } else {
      res.status(500).json({ success: false, message: '审计处理失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '处理审计记录失败', error: error.message })
  }
})

app.get('/api/audits/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const audits = db.audits

    const typeStats = {}
    const statusStats = { pending: 0, approved: 0, rejected: 0 }
    const riskStats = { high: 0, medium: 0, low: 0 }

    audits.forEach(audit => {
      if (!typeStats[audit.type]) {
        typeStats[audit.type] = 0
      }
      typeStats[audit.type]++

      statusStats[audit.status]++

      const riskLevel = getRiskLevel(audit.type)
      riskStats[riskLevel]++
    })

    res.json({
      success: true,
      data: {
        total: audits.length,
        ...statusStats,
        typeStats,
        riskStats,
        pendingRate: audits.length > 0 ? Math.round((statusStats.pending / audits.length) * 100) : 0,
        today: audits.filter(a => dayjs(a.createdAt).isSame(dayjs(), 'day')).length,
        thisWeek: audits.filter(a => dayjs(a.createdAt).isSame(dayjs(), 'week')).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`审计服务运行在 http://localhost:${PORT}`)
})
