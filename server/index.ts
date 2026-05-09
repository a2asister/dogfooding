const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3000
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'sleep-data.json')

app.use(cors())
app.use(express.json())

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

interface SleepStage {
  type: 'deep' | 'light' | 'rem' | 'awake'
  duration: number
  startTime: number
}

interface SleepData {
  id: string
  date: string
  bedTime: string
  wakeTime: string
  duration: number
  deepSleep: number
  lightSleep: number
  remSleep: number
  score: number
  stages: SleepStage[]
  quality: 'excellent' | 'good' | 'fair' | 'poor'
}

interface Reminder {
  id: string
  type: 'sleep' | 'wake'
  time: string
  enabled: boolean
  label: string
}

function readData(): SleepData[] {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = generateDefaultData()
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function writeData(data: SleepData[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function generateDefaultData(): SleepData[] {
  const data: SleepData[] = []
  const today = new Date()
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const bedHour = 22 + Math.floor(Math.random() * 3)
    const bedMin = Math.floor(Math.random() * 60)
    const wakeHour = 6 + Math.floor(Math.random() * 3)
    const wakeMin = Math.floor(Math.random() * 60)
    
    let duration = ((wakeHour + 24 - bedHour) * 60 + wakeMin - bedMin) / 60
    if (duration < 0) duration += 24
    
    const deepSleep = Math.round(duration * (0.15 + Math.random() * 0.1) * 10) / 10
    const remSleep = Math.round(duration * (0.2 + Math.random() * 0.1) * 10) / 10
    const lightSleep = Math.round((duration - deepSleep - remSleep) * 10) / 10
    
    const score = Math.round(60 + Math.random() * 35)
    let quality: SleepData['quality'] = 'fair'
    if (score >= 90) quality = 'excellent'
    else if (score >= 75) quality = 'good'
    else if (score >= 60) quality = 'fair'
    else quality = 'poor'
    
    const stages: SleepStage[] = []
    let currentTime = bedHour * 60 + bedMin
    const totalMin = Math.round(duration * 60)
    let elapsed = 0
    
    while (elapsed < totalMin) {
      const stageDuration = Math.min(15 + Math.floor(Math.random() * 45), totalMin - elapsed)
      const rand = Math.random()
      let type: SleepStage['type']
      if (rand < 0.2) type = 'deep'
      else if (rand < 0.45) type = 'rem'
      else if (rand < 0.9) type = 'light'
      else type = 'awake'
      
      stages.push({
        type,
        duration: stageDuration,
        startTime: currentTime
      })
      
      currentTime = (currentTime + stageDuration) % 1440
      elapsed += stageDuration
    }
    
    data.push({
      id: `sleep-${dateStr}`,
      date: dateStr,
      bedTime: `${String(bedHour).padStart(2, '0')}:${String(bedMin).padStart(2, '0')}`,
      wakeTime: `${String(wakeHour).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`,
      duration: Math.round(duration * 10) / 10,
      deepSleep,
      lightSleep,
      remSleep,
      score,
      stages,
      quality
    })
  }
  
  return data
}

app.get('/api/sleep', (req: any, res: any) => {
  const data = readData()
  res.json(data)
})

app.get('/api/sleep/today', (req: any, res: any) => {
  const data = readData()
  const today = new Date().toISOString().split('T')[0]
  const todayData = data.find((d: SleepData) => d.date === today)
  res.json(todayData || null)
})

app.get('/api/sleep/:id', (req: any, res: any) => {
  const data = readData()
  const record = data.find((d: SleepData) => d.id === req.params.id)
  res.json(record || null)
})

app.post('/api/sleep', (req: any, res: any) => {
  const data = readData()
  const newRecord: SleepData = {
    ...req.body,
    id: `sleep-${req.body.date || new Date().toISOString().split('T')[0]}`
  }
  const index = data.findIndex((d: SleepData) => d.id === newRecord.id)
  if (index >= 0) {
    data[index] = newRecord
  } else {
    data.push(newRecord)
  }
  writeData(data)
  res.json(newRecord)
})

app.get('/api/sleep/stats/range', (req: any, res: any) => {
  const { start, end } = req.query
  const data = readData()
  const filtered = data.filter((d: SleepData) => {
    if (start && d.date < (start as string)) return false
    if (end && d.date > (end as string)) return false
    return true
  })
  res.json(filtered)
})

const defaultReminders: Reminder[] = [
  { id: '1', type: 'sleep', time: '22:30', enabled: true, label: '睡觉提醒' },
  { id: '2', type: 'wake', time: '07:00', enabled: true, label: '起床提醒' }
]

const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json')

function readReminders(): Reminder[] {
  if (!fs.existsSync(REMINDERS_FILE)) {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(defaultReminders, null, 2))
    return defaultReminders
  }
  return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8'))
}

function writeReminders(data: Reminder[]) {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(data, null, 2))
}

app.get('/api/reminders', (req: any, res: any) => {
  res.json(readReminders())
})

app.put('/api/reminders/:id', (req: any, res: any) => {
  const data = readReminders()
  const index = data.findIndex((r: Reminder) => r.id === req.params.id)
  if (index >= 0) {
    data[index] = { ...data[index], ...req.body }
    writeReminders(data)
    res.json(data[index])
  } else {
    res.status(404).json({ error: 'Not found' })
  }
})

app.post('/api/reminders', (req: any, res: any) => {
  const data = readReminders()
  const newReminder: Reminder = {
    id: `reminder-${Date.now()}`,
    ...req.body
  }
  data.push(newReminder)
  writeReminders(data)
  res.json(newReminder)
})

app.delete('/api/reminders/:id', (req: any, res: any) => {
  const data = readReminders()
  const filtered = data.filter((r: Reminder) => r.id !== req.params.id)
  writeReminders(filtered)
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`Sleep monitor API running on http://localhost:${PORT}`)
})
