import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/users.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { users: [], total: 0 }
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
  res.json({ success: true, message: '用户服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/users', (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, departmentId } = req.query
    const db = readDatabase()
    let users = [...db.users]

    if (keyword) {
      users = users.filter(u => 
        u.username.includes(keyword) ||
        u.realName.includes(keyword) ||
        u.email.includes(keyword)
      )
    }

    if (status) {
      users = users.filter(u => u.status === status)
    }

    if (departmentId) {
      users = users.filter(u => u.departmentId === departmentId)
    }

    const total = users.length
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedUsers = users.slice(start, end)

    res.json({
      success: true,
      data: paginatedUsers,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户列表失败', error: error.message })
  }
})

app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const user = db.users.find(u => u.id === id)

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户详情失败', error: error.message })
  }
})

app.post('/api/users', (req, res) => {
  try {
    const { username, password, realName, email, phone, departmentId, roleIds, avatar } = req.body

    if (!username || !password || !realName) {
      return res.status(400).json({ success: false, message: '用户名、密码、真实姓名为必填项' })
    }

    const db = readDatabase()

    const existingUser = db.users.find(u => u.username === username)
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' })
    }

    const newUser = {
      id: `u${Date.now().toString().slice(-3)}`,
      username,
      password,
      realName,
      email: email || '',
      phone: phone || '',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      departmentId: departmentId || '',
      roleIds: roleIds || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.users.unshift(newUser)
    db.total = db.users.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newUser, message: '创建成功' })
    } else {
      res.status(500).json({ success: false, message: '创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建用户失败', error: error.message })
  }
})

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const { password, ...updateData } = req.body

    const db = readDatabase()
    const userIndex = db.users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    if (updateData.username) {
      const existingUser = db.users.find(u => u.username === updateData.username && u.id !== id)
      if (existingUser) {
        return res.status(400).json({ success: false, message: '用户名已存在' })
      }
    }

    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updateData,
      ...(password && { password }),
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.users[userIndex], message: '更新成功' })
    } else {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新用户失败', error: error.message })
  }
})

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const userIndex = db.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }

    db.users.splice(userIndex, 1)
    db.total = db.users.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '删除成功' })
    } else {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除用户失败', error: error.message })
  }
})

app.post('/api/users/login', (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码为必填项' })
    }

    const db = readDatabase()
    const user = db.users.find(u => u.username === username && u.password === password)

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' })
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: '账户已禁用' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({ success: true, data: userWithoutPassword, message: '登录成功' })
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`用户服务运行在 http://localhost:${PORT}`)
})
