import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3004

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/departments.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { departments: [], total: 0 }
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

const buildTree = (departments, parentId = null) => {
  return departments
    .filter(d => d.parentId === parentId)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map(d => ({
      ...d,
      children: buildTree(departments, d.id)
    }))
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '部门服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/departments', (req, res) => {
  try {
    const { tree = 'true', status, keyword } = req.query
    const db = readDatabase()
    let departments = [...db.departments]

    if (status) {
      departments = departments.filter(d => d.status === status)
    }

    if (keyword) {
      departments = departments.filter(d =>
        d.name.includes(keyword) ||
        d.code.includes(keyword) ||
        (d.description && d.description.includes(keyword))
      )
    }

    if (tree === 'true') {
      const treeData = buildTree(departments)
      res.json({
        success: true,
        data: treeData,
        total: departments.length
      })
    } else {
      res.json({
        success: true,
        data: departments,
        total: departments.length
      })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '获取部门列表失败', error: error.message })
  }
})

app.get('/api/departments/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()
    const department = db.departments.find(d => d.id === id)

    if (!department) {
      return res.status(404).json({ success: false, message: '部门不存在' })
    }

    const getParentChain = (deptId, chain = []) => {
      const dept = db.departments.find(d => d.id === deptId)
      if (dept) {
        chain.unshift(dept)
        if (dept.parentId) {
          return getParentChain(dept.parentId, chain)
        }
      }
      return chain
    }

    const result = {
      ...department,
      parentChain: getParentChain(department.id)
    }

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取部门详情失败', error: error.message })
  }
})

app.post('/api/departments', (req, res) => {
  try {
    const { name, code, parentId, managerId, description, sort, status } = req.body

    if (!name || !code) {
      return res.status(400).json({ success: false, message: '部门名称和编码为必填项' })
    }

    const db = readDatabase()

    const existingDept = db.departments.find(d => d.code === code)
    if (existingDept) {
      return res.status(400).json({ success: false, message: '部门编码已存在' })
    }

    const newDept = {
      id: `d${Date.now().toString().slice(-3)}`,
      name,
      code,
      parentId: parentId || null,
      managerId: managerId || null,
      description: description || '',
      sort: sort || 0,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.departments.unshift(newDept)
    db.total = db.departments.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newDept, message: '创建成功' })
    } else {
      res.status(500).json({ success: false, message: '创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建部门失败', error: error.message })
  }
})

app.put('/api/departments/:id', (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const db = readDatabase()
    const deptIndex = db.departments.findIndex(d => d.id === id)

    if (deptIndex === -1) {
      return res.status(404).json({ success: false, message: '部门不存在' })
    }

    if (updateData.code) {
      const existingDept = db.departments.find(d => d.code === updateData.code && d.id !== id)
      if (existingDept) {
        return res.status(400).json({ success: false, message: '部门编码已存在' })
      }
    }

    if (updateData.parentId === id) {
      return res.status(400).json({ success: false, message: '不能将自己设为父部门' })
    }

    db.departments[deptIndex] = {
      ...db.departments[deptIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.departments[deptIndex], message: '更新成功' })
    } else {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新部门失败', error: error.message })
  }
})

app.delete('/api/departments/:id', (req, res) => {
  try {
    const { id } = req.params
    const db = readDatabase()

    const deptIndex = db.departments.findIndex(d => d.id === id)
    if (deptIndex === -1) {
      return res.status(404).json({ success: false, message: '部门不存在' })
    }

    const hasChildren = db.departments.some(d => d.parentId === id)
    if (hasChildren) {
      return res.status(400).json({ success: false, message: '存在子部门，无法删除' })
    }

    db.departments.splice(deptIndex, 1)
    db.total = db.departments.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '删除成功' })
    } else {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除部门失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`部门服务运行在 http://localhost:${PORT}`)
})
