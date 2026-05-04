import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/roles.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { roles: [], total: 0 }
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
  res.json({ success: true, message: '角色服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/roles', (req, res) => {
  try {
    const { page = 1, pageSize = 20, status } = req.query
    const db = readDatabase()
    let roles = [...db.roles]

    if (status) {
      roles = roles.filter(r => r.status === status)
    }

    const total = roles.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedData = roles.slice(start, end)

    res.json({
      success: true,
      data: paginatedData,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取角色列表失败', error: error.message })
  }
})

app.get('/api/roles/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const role = db.roles.find(r => r.id === id)

    if (!role) {
      return res.status(404).json({ success: false, message: '角色不存在' })
    }

    res.json({ success: true, data: role })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取角色详情失败', error: error.message })
  }
})

app.post('/api/roles', (req, res) => {
  try {
    const { name, code, description, permissionIds } = req.body

    if (!name || !code) {
      return res.status(400).json({ success: false, message: '角色名称、编码为必填项' })
    }

    const db = readDatabase()

    const existing = db.roles.find(r => r.code === code)
    if (existing) {
      return res.status(400).json({ success: false, message: '角色编码已存在' })
    }

    const newRole = {
      id: `r${Date.now().toString().slice(-3)}`,
      name,
      code,
      description: description || '',
      permissionIds: permissionIds || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.roles.push(newRole)
    db.total = db.roles.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newRole, message: '创建成功' })
    } else {
      res.status(500).json({ success: false, message: '创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建角色失败', error: error.message })
  }
})

app.put('/api/roles/:id', (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const db = readDatabase()
    const index = db.roles.findIndex(r => r.id === id)

    if (index === -1) {
      return res.status(404).json({ success: false, message: '角色不存在' })
    }

    if (updateData.code) {
      const existing = db.roles.find(r => r.code === updateData.code && r.id !== id)
      if (existing) {
        return res.status(400).json({ success: false, message: '角色编码已存在' })
      }
    }

    db.roles[index] = {
      ...db.roles[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.roles[index], message: '更新成功' })
    } else {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新角色失败', error: error.message })
  }
})

app.delete('/api/roles/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const index = db.roles.findIndex(r => r.id === id)
    if (index === -1) {
      return res.status(404).json({ success: false, message: '角色不存在' })
    }

    db.roles.splice(index, 1)
    db.total = db.roles.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '删除成功' })
    } else {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除角色失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`角色服务运行在 http://localhost:${PORT}`)
})
