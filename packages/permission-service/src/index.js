import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/permissions.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { permissions: [], total: 0 }
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
  res.json({ success: true, message: '权限服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/permissions', (req, res) => {
  try {
    const { page = 1, pageSize = 20, type, status } = req.query
    const db = readDatabase()
    let permissions = [...db.permissions]

    if (type) {
      permissions = permissions.filter(p => p.type === type)
    }

    if (status) {
      permissions = permissions.filter(p => p.status === status)
    }

    const total = permissions.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedData = permissions.slice(start, end)

    res.json({
      success: true,
      data: paginatedData,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取权限列表失败', error: error.message })
  }
})

app.get('/api/permissions/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const permission = db.permissions.find(p => p.id === id)

    if (!permission) {
      return res.status(404).json({ success: false, message: '权限不存在' })
    }

    res.json({ success: true, data: permission })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取权限详情失败', error: error.message })
  }
})

app.post('/api/permissions', (req, res) => {
  try {
    const { name, code, type, parentId, description, path, icon, sort } = req.body

    if (!name || !code || !type) {
      return res.status(400).json({ success: false, message: '权限名称、编码、类型为必填项' })
    }

    const db = readDatabase()

    const existing = db.permissions.find(p => p.code === code)
    if (existing) {
      return res.status(400).json({ success: false, message: '权限编码已存在' })
    }

    const newPermission = {
      id: `p${Date.now().toString().slice(-3)}`,
      name,
      code,
      type,
      parentId: parentId || null,
      description: description || '',
      path: path || null,
      icon: icon || null,
      sort: sort || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.permissions.push(newPermission)
    db.total = db.permissions.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newPermission, message: '创建成功' })
    } else {
      res.status(500).json({ success: false, message: '创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建权限失败', error: error.message })
  }
})

app.put('/api/permissions/:id', (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const db = readDatabase()
    const index = db.permissions.findIndex(p => p.id === id)

    if (index === -1) {
      return res.status(404).json({ success: false, message: '权限不存在' })
    }

    if (updateData.code) {
      const existing = db.permissions.find(p => p.code === updateData.code && p.id !== id)
      if (existing) {
        return res.status(400).json({ success: false, message: '权限编码已存在' })
      }
    }

    db.permissions[index] = {
      ...db.permissions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.permissions[index], message: '更新成功' })
    } else {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新权限失败', error: error.message })
  }
})

app.delete('/api/permissions/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const index = db.permissions.findIndex(p => p.id === id)
    if (index === -1) {
      return res.status(404).json({ success: false, message: '权限不存在' })
    }

    const hasChildren = db.permissions.some(p => p.parentId === id)
    if (hasChildren) {
      return res.status(400).json({ success: false, message: '该权限下有子权限，无法删除' })
    }

    db.permissions.splice(index, 1)
    db.total = db.permissions.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '删除成功' })
    } else {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除权限失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`权限服务运行在 http://localhost:${PORT}`)
})
