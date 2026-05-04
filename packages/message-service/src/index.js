import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3009

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/messages.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { messages: [], total: 0 }
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
  res.json({ success: true, message: '消息服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/messages', (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      userId,
      type,
      isRead,
      isImportant,
      keyword
    } = req.query
    const db = readDatabase()
    let messages = [...db.messages]

    if (userId) {
      messages = messages.filter(m => 
        m.receiverType === 'all' || 
        m.receiverIds.includes(userId)
      )
    }

    if (type) {
      const types = type.split(',')
      messages = messages.filter(m => types.includes(m.type))
    }

    if (isRead !== undefined && isRead !== '') {
      messages = messages.filter(m => 
        userId ? m.readBy.includes(userId) === (isRead === 'true') : m.isRead === (isRead === 'true')
      )
    }

    if (isImportant === 'true') {
      messages = messages.filter(m => m.isImportant === true)
    }

    if (keyword) {
      messages = messages.filter(m =>
        m.title.includes(keyword) ||
        m.content.includes(keyword)
      )
    }

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = messages.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedMessages = messages.slice(start, end)

    const statistics = {
      total: db.messages.length,
      unread: db.messages.filter(m => !m.isRead).length,
      important: db.messages.filter(m => m.isImportant).length,
      system: db.messages.filter(m => m.type === 'system').length,
      notification: db.messages.filter(m => m.type === 'notification').length,
      message: db.messages.filter(m => m.type === 'message').length
    }

    res.json({
      success: true,
      data: paginatedMessages,
      statistics,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取消息列表失败', error: error.message })
  }
})

app.get('/api/messages/:id', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    const db = readDatabase()
    const messageIndex = db.messages.findIndex(m => m.id === id)

    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: '消息不存在' })
    }

    const message = db.messages[messageIndex]

    if (userId && !message.readBy.includes(userId)) {
      message.readBy.push(userId)
      if (message.receiverType === 'specific' && message.readBy.length === message.receiverIds.length) {
        message.isRead = true
      }
      message.updatedAt = new Date().toISOString()
      writeDatabase(db)
    }

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取消息详情失败', error: error.message })
  }
})

app.post('/api/messages', (req, res) => {
  try {
    const { 
      type, 
      title, 
      content, 
      senderId, 
      senderName,
      receiverIds,
      receiverType,
      priority,
      isImportant,
      attachments,
      relatedType,
      relatedId,
      expireAt
    } = req.body

    if (!title || !content) {
      return res.status(400).json({ success: false, message: '标题和内容为必填项' })
    }

    const db = readDatabase()

    const newMessage = {
      id: `m${Date.now().toString().slice(-3)}`,
      type: type || 'notification',
      title,
      content,
      senderId: senderId || 'system',
      senderName: senderName || '系统通知',
      receiverIds: receiverIds || ['all'],
      receiverType: receiverType || 'all',
      priority: priority || 'low',
      readBy: [],
      isRead: false,
      isImportant: isImportant || false,
      attachments: attachments || [],
      relatedType: relatedType || null,
      relatedId: relatedId || null,
      createdAt: new Date().toISOString(),
      expireAt: expireAt || null
    }

    db.messages.unshift(newMessage)
    db.total = db.messages.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newMessage, message: '消息发送成功' })
    } else {
      res.status(500).json({ success: false, message: '消息发送失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '发送消息失败', error: error.message })
  }
})

app.put('/api/messages/:id/mark-read', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const db = readDatabase()
    const messageIndex = db.messages.findIndex(m => m.id === id)

    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: '消息不存在' })
    }

    const message = db.messages[messageIndex]

    if (userId) {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId)
      }
    } else {
      message.isRead = true
    }

    if (message.receiverType === 'specific' && message.readBy.length === message.receiverIds.length) {
      message.isRead = true
    }

    message.updatedAt = new Date().toISOString()

    if (writeDatabase(db)) {
      res.json({ success: true, data: message, message: '已标记为已读' })
    } else {
      res.status(500).json({ success: false, message: '操作失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '标记已读失败', error: error.message })
  }
})

app.put('/api/messages/:id/mark-important', (req, res) => {
  try {
    const { id } = req.params

    const db = readDatabase()
    const messageIndex = db.messages.findIndex(m => m.id === id)

    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: '消息不存在' })
    }

    db.messages[messageIndex].isImportant = !db.messages[messageIndex].isImportant
    db.messages[messageIndex].updatedAt = new Date().toISOString()

    if (writeDatabase(db)) {
      res.json({ 
        success: true, 
        data: db.messages[messageIndex], 
        message: db.messages[messageIndex].isImportant ? '已标记为重要' : '已取消重要标记' 
      })
    } else {
      res.status(500).json({ success: false, message: '操作失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '标记重要失败', error: error.message })
  }
})

app.put('/api/messages/mark-all-read', (req, res) => {
  try {
    const { userId } = req.body

    const db = readDatabase()

    db.messages.forEach(message => {
      if (userId) {
        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId)
        }
      } else {
        message.isRead = true
      }
      message.updatedAt = new Date().toISOString()
    })

    if (writeDatabase(db)) {
      res.json({ success: true, message: '已全部标记为已读' })
    } else {
      res.status(500).json({ success: false, message: '操作失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '批量标记已读失败', error: error.message })
  }
})

app.delete('/api/messages/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const messageIndex = db.messages.findIndex(m => m.id === id)
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: '消息不存在' })
    }

    db.messages.splice(messageIndex, 1)
    db.total = db.messages.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '消息删除成功' })
    } else {
      res.status(500).json({ success: false, message: '消息删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除消息失败', error: error.message })
  }
})

app.get('/api/messages/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const messages = db.messages
    const now = new Date()

    const typeStats = {}
    const priorityStats = { high: 0, medium: 0, low: 0 }

    messages.forEach(message => {
      if (!typeStats[message.type]) {
        typeStats[message.type] = 0
      }
      typeStats[message.type]++

      priorityStats[message.priority]++
    })

    const unreadCount = messages.filter(m => !m.isRead).length
    const importantCount = messages.filter(m => m.isImportant).length
    const expiredCount = messages.filter(m => m.expireAt && new Date(m.expireAt) < now).length

    res.json({
      success: true,
      data: {
        total: messages.length,
        unread: unreadCount,
        important: importantCount,
        expired: expiredCount,
        typeStats,
        priorityStats,
        today: messages.filter(m => dayjs(m.createdAt).isSame(dayjs(), 'day')).length,
        thisWeek: messages.filter(m => dayjs(m.createdAt).isSame(dayjs(), 'week')).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`消息服务运行在 http://localhost:${PORT}`)
})
