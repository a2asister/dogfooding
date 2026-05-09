import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import fs from 'fs'
import path from 'path'

const app = new Koa()
const router = new Router()

const DATA_DIR = path.join(__dirname, '../data')
const DATA_FILE = path.join(DATA_DIR, 'foods.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readData(): any {
  if (!fs.existsSync(DATA_FILE)) {
    return { foods: [] }
  }
  const content = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(content)
}

function writeData(data: any): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

router.get('/api/foods', (ctx) => {
  const { category, month } = ctx.query
  let { foods } = readData()

  if (category) {
    foods = foods.filter((f: any) => f.category === category)
  }

  if (month) {
    const monthStr = month as string
    foods = foods.filter((f: any) => f.visitDate.startsWith(monthStr))
  }

  ctx.body = foods
})

router.get('/api/foods/stats', (ctx) => {
  const { foods } = readData()
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  
  const monthlyStats: { [key: string]: number } = {}
  const categoryStats: { [key: string]: number } = {}

  foods.forEach((f: any) => {
    const month = f.visitDate.substring(0, 7)
    monthlyStats[month] = (monthlyStats[month] || 0) + 1
    categoryStats[f.category] = (categoryStats[f.category] || 0) + 1
  })

  ctx.body = {
    total: foods.length,
    currentMonth: monthlyStats[currentMonth] || 0,
    monthlyStats,
    categoryStats
  }
})

router.post('/api/foods', (ctx) => {
  const data = readData()
  const food = ctx.request.body as any
  food.id = Date.now().toString()
  data.foods.unshift(food)
  writeData(data)
  ctx.body = food
})

router.put('/api/foods/:id', (ctx) => {
  const data = readData()
  const { id } = ctx.params
  const index = data.foods.findIndex((f: any) => f.id === id)
  
  if (index === -1) {
    ctx.status = 404
    ctx.body = { error: 'Not found' }
    return
  }

  data.foods[index] = { ...data.foods[index], ...(ctx.request.body as object) }
  writeData(data)
  ctx.body = data.foods[index]
})

router.delete('/api/foods/:id', (ctx) => {
  const data = readData()
  const { id } = ctx.params
  data.foods = data.foods.filter((f: any) => f.id !== id)
  writeData(data)
  ctx.status = 204
})

app.use(bodyParser())
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  ctx.set('Access-Control-Allow-Headers', 'Content-Type')
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
  } else {
    await next()
  }
})
app.use(router.routes())
app.use(router.allowedMethods())

const PORT = 23456
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
