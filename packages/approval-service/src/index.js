import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3008

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/approvals.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { approvals: [], total: 0 }
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
  res.json({ success: true, message: '审批服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/approvals', (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      type,
      creatorId,
      approverId,
      departmentId,
      keyword
    } = req.query
    const db = readDatabase()
    let approvals = [...db.approvals]

    if (status) {
      const statuses = status.split(',')
      approvals = approvals.filter(a => statuses.includes(a.status))
    }

    if (type) {
      approvals = approvals.filter(a => a.type === type)
    }

    if (creatorId) {
      approvals = approvals.filter(a => a.creatorId === creatorId)
    }

    if (approverId) {
      approvals = approvals.filter(a => 
        a.workflow.some(step => step.approverId === approverId)
      )
    }

    if (departmentId) {
      approvals = approvals.filter(a => a.departmentId === departmentId)
    }

    if (keyword) {
      approvals = approvals.filter(a =>
        a.title.includes(keyword) ||
        a.description.includes(keyword)
      )
    }

    approvals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = approvals.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedApprovals = approvals.slice(start, end)

    const statistics = {
      total: db.approvals.length,
      pending: db.approvals.filter(a => a.status === 'pending').length,
      approved: db.approvals.filter(a => a.status === 'approved').length,
      rejected: db.approvals.filter(a => a.status === 'rejected').length
    }

    res.json({
      success: true,
      data: paginatedApprovals,
      statistics,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取审批列表失败', error: error.message })
  }
})

app.get('/api/approvals/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const approval = db.approvals.find(a => a.id === id)

    if (!approval) {
      return res.status(404).json({ success: false, message: '审批不存在' })
    }

    res.json({ success: true, data: approval })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取审批详情失败', error: error.message })
  }
})

app.post('/api/approvals', (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      creatorId, 
      creatorName,
      departmentId,
      formData,
      workflow
    } = req.body

    if (!title || !creatorId) {
      return res.status(400).json({ success: false, message: '标题和创建者为必填项' })
    }

    const db = readDatabase()

    const newApproval = {
      id: `ap${Date.now().toString().slice(-3)}`,
      title,
      type: type || 'general',
      description: description || '',
      creatorId,
      creatorName: creatorName || '',
      departmentId: departmentId || null,
      currentStep: 1,
      totalSteps: workflow ? workflow.length : 1,
      status: 'pending',
      formData: formData || {},
      workflow: workflow || [
        {
          step: 1,
          name: '审批',
          approverId: null,
          approverName: '待分配',
          status: 'pending',
          comment: null,
          approvedAt: null
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    }

    db.approvals.unshift(newApproval)
    db.total = db.approvals.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newApproval, message: '审批创建成功' })
    } else {
      res.status(500).json({ success: false, message: '审批创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建审批失败', error: error.message })
  }
})

app.put('/api/approvals/:id/approve', (req, res) => {
  try {
    const { id } = req.params
    const { step, approverId, approverName, comment } = req.body

    const db = readDatabase()
    const approvalIndex = db.approvals.findIndex(a => a.id === id)

    if (approvalIndex === -1) {
      return res.status(404).json({ success: false, message: '审批不存在' })
    }

    const approval = db.approvals[approvalIndex]

    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: '该审批已处理' })
    }

    const stepIndex = approval.workflow.findIndex(s => s.step === step)
    if (stepIndex === -1) {
      return res.status(400).json({ success: false, message: '无效的审批步骤' })
    }

    if (approval.workflow[stepIndex].status !== 'pending') {
      return res.status(400).json({ success: false, message: '该步骤已处理' })
    }

    approval.workflow[stepIndex] = {
      ...approval.workflow[stepIndex],
      approverId: approverId || null,
      approverName: approverName || approval.workflow[stepIndex].approverName,
      status: 'approved',
      comment: comment || null,
      approvedAt: new Date().toISOString()
    }

    const nextStep = step + 1
    const hasNextStep = approval.workflow.some(s => s.step === nextStep)

    if (hasNextStep) {
      approval.currentStep = nextStep
    } else {
      approval.status = 'approved'
      approval.completedAt = new Date().toISOString()
    }

    approval.updatedAt = new Date().toISOString()

    if (writeDatabase(db)) {
      res.json({ success: true, data: approval, message: '审批通过' })
    } else {
      res.status(500).json({ success: false, message: '审批失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '处理审批失败', error: error.message })
  }
})

app.put('/api/approvals/:id/reject', (req, res) => {
  try {
    const { id } = req.params
    const { step, approverId, approverName, comment } = req.body

    const db = readDatabase()
    const approvalIndex = db.approvals.findIndex(a => a.id === id)

    if (approvalIndex === -1) {
      return res.status(404).json({ success: false, message: '审批不存在' })
    }

    const approval = db.approvals[approvalIndex]

    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: '该审批已处理' })
    }

    const stepIndex = approval.workflow.findIndex(s => s.step === step)
    if (stepIndex === -1) {
      return res.status(400).json({ success: false, message: '无效的审批步骤' })
    }

    if (approval.workflow[stepIndex].status !== 'pending') {
      return res.status(400).json({ success: false, message: '该步骤已处理' })
    }

    approval.workflow[stepIndex] = {
      ...approval.workflow[stepIndex],
      approverId: approverId || null,
      approverName: approverName || approval.workflow[stepIndex].approverName,
      status: 'rejected',
      comment: comment || null,
      approvedAt: new Date().toISOString()
    }

    approval.workflow.forEach((s, idx) => {
      if (idx > stepIndex) {
        s.status = 'cancelled'
      }
    })

    approval.status = 'rejected'
    approval.completedAt = new Date().toISOString()
    approval.updatedAt = new Date().toISOString()

    if (writeDatabase(db)) {
      res.json({ success: true, data: approval, message: '审批驳回' })
    } else {
      res.status(500).json({ success: false, message: '审批失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '处理审批失败', error: error.message })
  }
})

app.put('/api/approvals/:id/cancel', (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const db = readDatabase()
    const approvalIndex = db.approvals.findIndex(a => a.id === id)

    if (approvalIndex === -1) {
      return res.status(404).json({ success: false, message: '审批不存在' })
    }

    const approval = db.approvals[approvalIndex]

    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: '只能取消待处理的审批' })
    }

    approval.workflow.forEach(s => {
      if (s.status === 'pending') {
        s.status = 'cancelled'
      }
    })

    approval.status = 'cancelled'
    approval.completedAt = new Date().toISOString()
    approval.updatedAt = new Date().toISOString()

    if (writeDatabase(db)) {
      res.json({ success: true, data: approval, message: '审批已取消' })
    } else {
      res.status(500).json({ success: false, message: '取消失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '取消审批失败', error: error.message })
  }
})

app.get('/api/approvals/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const approvals = db.approvals

    const typeStats = {}
    const statusStats = {
      total: approvals.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    }

    approvals.forEach(approval => {
      if (!typeStats[approval.type]) {
        typeStats[approval.type] = 0
      }
      typeStats[approval.type]++

      statusStats[approval.status]++
    })

    res.json({
      success: true,
      data: {
        ...statusStats,
        typeStats,
        today: approvals.filter(a => dayjs(a.createdAt).isSame(dayjs(), 'day')).length,
        thisWeek: approvals.filter(a => dayjs(a.createdAt).isSame(dayjs(), 'week')).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`审批服务运行在 http://localhost:${PORT}`)
})
