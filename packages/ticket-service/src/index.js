import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3007

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/tickets.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { tickets: [], total: 0 }
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

const statusFlow = {
  open: ['in_progress', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: ['closed'],
  closed: []
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '工单服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/tickets', (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      type, 
      priority,
      creatorId,
      assigneeId,
      departmentId,
      keyword,
      isOverdue,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query
    const db = readDatabase()
    let tickets = [...db.tickets]

    if (status) {
      const statuses = status.split(',')
      tickets = tickets.filter(t => statuses.includes(t.status))
    }

    if (type) {
      tickets = tickets.filter(t => t.type === type)
    }

    if (priority) {
      tickets = tickets.filter(t => t.priority === priority)
    }

    if (creatorId) {
      tickets = tickets.filter(t => t.creatorId === creatorId)
    }

    if (assigneeId) {
      tickets = tickets.filter(t => t.assigneeId === assigneeId)
    }

    if (departmentId) {
      tickets = tickets.filter(t => t.departmentId === departmentId)
    }

    if (isOverdue === 'true') {
      const now = new Date()
      tickets = tickets.filter(t => 
        t.status !== 'closed' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      )
    }

    if (keyword) {
      tickets = tickets.filter(t =>
        t.title.includes(keyword) ||
        t.description.includes(keyword) ||
        (t.tags && t.tags.some(tag => tag.includes(keyword)))
      )
    }

    tickets.sort((a, b) => {
      const aVal = a[sortBy] || a.createdAt
      const bVal = b[sortBy] || b.createdAt
      if (sortOrder === 'asc') {
        return new Date(aVal) - new Date(bVal)
      }
      return new Date(bVal) - new Date(aVal)
    })

    const total = tickets.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedTickets = tickets.slice(start, end)

    const now = new Date()
    const enrichedTickets = paginatedTickets.map(t => ({
      ...t,
      isOverdue: t.status !== 'closed' && t.dueDate && new Date(t.dueDate) < now,
      allowedTransitions: statusFlow[t.status] || []
    }))

    const statistics = {
      total: db.tickets.length,
      open: db.tickets.filter(t => t.status === 'open').length,
      inProgress: db.tickets.filter(t => t.status === 'in_progress').length,
      resolved: db.tickets.filter(t => t.status === 'resolved').length,
      closed: db.tickets.filter(t => t.status === 'closed').length,
      overdue: db.tickets.filter(t => 
        t.status !== 'closed' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length,
      highPriority: db.tickets.filter(t => t.priority === 'high' && t.status !== 'closed').length
    }

    res.json({
      success: true,
      data: enrichedTickets,
      statistics,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取工单列表失败', error: error.message })
  }
})

app.get('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const ticket = db.tickets.find(t => t.id === id)

    if (!ticket) {
      return res.status(404).json({ success: false, message: '工单不存在' })
    }

    const now = new Date()
    const result = {
      ...ticket,
      isOverdue: ticket.status !== 'closed' && ticket.dueDate && new Date(ticket.dueDate) < now,
      allowedTransitions: statusFlow[ticket.status] || []
    }

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取工单详情失败', error: error.message })
  }
})

app.post('/api/tickets', (req, res) => {
  try {
    const { 
      title, 
      description, 
      type, 
      priority, 
      creatorId, 
      creatorName,
      assigneeId,
      assigneeName,
      departmentId,
      tags,
      dueDate
    } = req.body

    if (!title || !creatorId) {
      return res.status(400).json({ success: false, message: '标题和创建者为必填项' })
    }

    const db = readDatabase()

    const newTicket = {
      id: `t${Date.now().toString().slice(-3)}`,
      title,
      description: description || '',
      type: type || 'bug',
      priority: priority || 'medium',
      status: 'open',
      creatorId,
      creatorName: creatorName || '',
      assigneeId: assigneeId || null,
      assigneeName: assigneeName || null,
      departmentId: departmentId || null,
      tags: tags || [],
      attachmentIds: [],
      dueDate: dueDate || null,
      resolution: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null
    }

    db.tickets.unshift(newTicket)
    db.total = db.tickets.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newTicket, message: '工单创建成功' })
    } else {
      res.status(500).json({ success: false, message: '工单创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建工单失败', error: error.message })
  }
})

app.put('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const db = readDatabase()
    const ticketIndex = db.tickets.findIndex(t => t.id === id)

    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, message: '工单不存在' })
    }

    db.tickets[ticketIndex] = {
      ...db.tickets[ticketIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.tickets[ticketIndex], message: '工单更新成功' })
    } else {
      res.status(500).json({ success: false, message: '工单更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新工单失败', error: error.message })
  }
})

app.put('/api/tickets/:id/status', (req, res) => {
  try {
    const { id } = req.params
    const { status, resolution, operatorId, operatorName } = req.body

    if (!status) {
      return res.status(400).json({ success: false, message: '状态为必填项' })
    }

    const db = readDatabase()
    const ticketIndex = db.tickets.findIndex(t => t.id === id)

    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, message: '工单不存在' })
    }

    const currentTicket = db.tickets[ticketIndex]
    const allowedTransitions = statusFlow[currentTicket.status] || []

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `无法从状态 ${currentTicket.status} 转换到 ${status}` 
      })
    }

    const updates = {
      status,
      updatedAt: new Date().toISOString()
    }

    if (resolution) {
      updates.resolution = resolution
    }

    if (status === 'closed') {
      updates.closedAt = new Date().toISOString()
    }

    db.tickets[ticketIndex] = {
      ...currentTicket,
      ...updates
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.tickets[ticketIndex], message: '工单状态更新成功' })
    } else {
      res.status(500).json({ success: false, message: '工单状态更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新工单状态失败', error: error.message })
  }
})

app.delete('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const ticketIndex = db.tickets.findIndex(t => t.id === id)
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, message: '工单不存在' })
    }

    db.tickets.splice(ticketIndex, 1)
    db.total = db.tickets.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '工单删除成功' })
    } else {
      res.status(500).json({ success: false, message: '工单删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除工单失败', error: error.message })
  }
})

app.get('/api/tickets/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const tickets = db.tickets
    const now = new Date()

    const statusStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    }

    const priorityStats = {
      high: tickets.filter(t => t.priority === 'high').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      low: tickets.filter(t => t.priority === 'low').length
    }

    const typeStats = {}
    tickets.forEach(t => {
      if (!typeStats[t.type]) {
        typeStats[t.type] = 0
      }
      typeStats[t.type]++
    })

    const overdueCount = tickets.filter(t => 
      t.status !== 'closed' && 
      t.dueDate && 
      new Date(t.dueDate) < now
    ).length

    res.json({
      success: true,
      data: {
        ...statusStats,
        priorityStats,
        typeStats,
        overdue: overdueCount,
        today: tickets.filter(t => dayjs(t.createdAt).isSame(dayjs(), 'day')).length,
        thisWeek: tickets.filter(t => dayjs(t.createdAt).isSame(dayjs(), 'week')).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`工单服务运行在 http://localhost:${PORT}`)
})
