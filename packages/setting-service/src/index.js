import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3010

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, '../../../database/settings.json')

const readDatabase = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取数据库失败:', error)
    return { settings: [], categories: [], total: 0 }
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
  res.json({ success: true, message: '设置服务运行正常', timestamp: new Date().toISOString() })
})

app.get('/api/settings', (req, res) => {
  try {
    const { category, isPublic, keyword } = req.query
    const db = readDatabase()
    let settings = [...db.settings]

    if (category) {
      settings = settings.filter(s => s.category === category)
    }

    if (isPublic !== undefined) {
      settings = settings.filter(s => s.isPublic === (isPublic === 'true'))
    }

    if (keyword) {
      settings = settings.filter(s =>
        s.key.includes(keyword) ||
        s.description.includes(keyword)
      )
    }

    const categories = db.categories || []

    const statistics = {
      total: db.settings.length,
      byCategory: {}
    }

    categories.forEach(cat => {
      statistics.byCategory[cat.code] = {
        name: cat.name,
        count: db.settings.filter(s => s.category === cat.code).length
      }
    })

    res.json({
      success: true,
      data: settings,
      categories,
      statistics,
      total: settings.length
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取设置列表失败', error: error.message })
  }
})

app.get('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params
    const db = readDatabase()
    const setting = db.settings.find(s => s.key === key)

    if (!setting) {
      return res.status(404).json({ success: false, message: '配置项不存在' })
    }

    let parsedValue = setting.value
    if (setting.type === 'number') {
      parsedValue = Number(setting.value)
    } else if (setting.type === 'boolean') {
      parsedValue = setting.value === 'true'
    } else if (setting.type === 'json') {
      try {
        parsedValue = JSON.parse(setting.value)
      } catch (e) {
        parsedValue = setting.value
      }
    }

    const result = {
      ...setting,
      value: parsedValue
    }

    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取配置项失败', error: error.message })
  }
})

app.post('/api/settings', (req, res) => {
  try {
    const { category, key, value, description, type, isPublic } = req.body

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: '配置项键和值为必填项' })
    }

    const db = readDatabase()

    const existingSetting = db.settings.find(s => s.key === key)
    if (existingSetting) {
      return res.status(400).json({ success: false, message: '配置项键已存在' })
    }

    let storedValue = value
    if (type === 'number') {
      storedValue = String(value)
    } else if (type === 'boolean') {
      storedValue = String(value)
    } else if (type === 'json') {
      storedValue = JSON.stringify(value)
    }

    const newSetting = {
      id: `s${Date.now().toString().slice(-3)}`,
      category: category || 'general',
      key,
      value: storedValue,
      description: description || '',
      type: type || 'string',
      isPublic: isPublic !== undefined ? isPublic : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.settings.push(newSetting)
    db.total = db.settings.length

    if (writeDatabase(db)) {
      res.json({ success: true, data: newSetting, message: '配置项创建成功' })
    } else {
      res.status(500).json({ success: false, message: '配置项创建失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '创建配置项失败', error: error.message })
  }
})

app.put('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params
    const { value, description, isPublic } = req.body

    if (value === undefined) {
      return res.status(400).json({ success: false, message: '配置项值为必填项' })
    }

    const db = readDatabase()
    const settingIndex = db.settings.findIndex(s => s.key === key)

    if (settingIndex === -1) {
      return res.status(404).json({ success: false, message: '配置项不存在' })
    }

    const setting = db.settings[settingIndex]

    let storedValue = value
    if (setting.type === 'number') {
      storedValue = String(value)
    } else if (setting.type === 'boolean') {
      storedValue = String(value)
    } else if (setting.type === 'json') {
      storedValue = JSON.stringify(value)
    }

    db.settings[settingIndex] = {
      ...setting,
      value: storedValue,
      description: description !== undefined ? description : setting.description,
      isPublic: isPublic !== undefined ? isPublic : setting.isPublic,
      updatedAt: new Date().toISOString()
    }

    if (writeDatabase(db)) {
      res.json({ success: true, data: db.settings[settingIndex], message: '配置项更新成功' })
    } else {
      res.status(500).json({ success: false, message: '配置项更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '更新配置项失败', error: error.message })
  }
})

app.put('/api/settings/batch/update', (req, res) => {
  try {
    const { updates } = req.body

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: '更新数据格式错误' })
    }

    const db = readDatabase()
    const updatedKeys = []

    updates.forEach(update => {
      const { key, value, description, isPublic } = update
      const settingIndex = db.settings.findIndex(s => s.key === key)

      if (settingIndex !== -1) {
        const setting = db.settings[settingIndex]
        let storedValue = value

        if (setting.type === 'number') {
          storedValue = String(value)
        } else if (setting.type === 'boolean') {
          storedValue = String(value)
        } else if (setting.type === 'json') {
          storedValue = JSON.stringify(value)
        }

        db.settings[settingIndex] = {
          ...setting,
          value: storedValue,
          description: description !== undefined ? description : setting.description,
          isPublic: isPublic !== undefined ? isPublic : setting.isPublic,
          updatedAt: new Date().toISOString()
        }

        updatedKeys.push(key)
      }
    })

    if (writeDatabase(db)) {
      res.json({ 
        success: true, 
        data: { updated: updatedKeys.length, keys: updatedKeys },
        message: `成功更新 ${updatedKeys.length} 个配置项` 
      })
    } else {
      res.status(500).json({ success: false, message: '批量更新失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '批量更新配置项失败', error: error.message })
  }
})

app.delete('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params
    const db = readDatabase()

    const settingIndex = db.settings.findIndex(s => s.key === key)
    if (settingIndex === -1) {
      return res.status(404).json({ success: false, message: '配置项不存在' })
    }

    db.settings.splice(settingIndex, 1)
    db.total = db.settings.length

    if (writeDatabase(db)) {
      res.json({ success: true, message: '配置项删除成功' })
    } else {
      res.status(500).json({ success: false, message: '配置项删除失败' })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '删除配置项失败', error: error.message })
  }
})

app.get('/api/settings/statistics/summary', (req, res) => {
  try {
    const db = readDatabase()
    const settings = db.settings

    const categoryStats = {}
    const typeStats = {}

    settings.forEach(setting => {
      if (!categoryStats[setting.category]) {
        categoryStats[setting.category] = 0
      }
      categoryStats[setting.category]++

      if (!typeStats[setting.type]) {
        typeStats[setting.type] = 0
      }
      typeStats[setting.type]++
    })

    res.json({
      success: true,
      data: {
        total: settings.length,
        categories: db.categories || [],
        categoryStats,
        typeStats,
        publicCount: settings.filter(s => s.isPublic).length,
        privateCount: settings.filter(s => !s.isPublic).length
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计信息失败', error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`设置服务运行在 http://localhost:${PORT}`)
})
