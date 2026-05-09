import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SleepData, Reminder } from '@/types'

function generateMockData(): SleepData[] {
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
    
    const stages: any[] = []
    let currentTime = bedHour * 60 + bedMin
    const totalMin = Math.round(duration * 60)
    let elapsed = 0
    
    while (elapsed < totalMin) {
      const stageDuration = Math.min(15 + Math.floor(Math.random() * 45), totalMin - elapsed)
      const rand = Math.random()
      let type: 'deep' | 'light' | 'rem' | 'awake'
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

const mockData = generateMockData()
const mockReminders: Reminder[] = [
  { id: '1', type: 'sleep', time: '22:30', enabled: true, label: '睡觉提醒' },
  { id: '2', type: 'wake', time: '07:00', enabled: true, label: '起床提醒' }
]

export const useSleepStore = defineStore('sleep', () => {
  const todayData = ref<SleepData | null>(null)
  const historyData = ref<SleepData[]>([])
  const reminders = ref<Reminder[]>([])
  const loading = ref(false)

  const avgScore = computed(() => {
    if (historyData.value.length === 0) return 0
    const sum = historyData.value.reduce((acc, d) => acc + d.score, 0)
    return Math.round(sum / historyData.value.length)
  })

  const avgDuration = computed(() => {
    if (historyData.value.length === 0) return 0
    const sum = historyData.value.reduce((acc, d) => acc + d.duration, 0)
    return Math.round((sum / historyData.value.length) * 10) / 10
  })

  async function fetchToday() {
    loading.value = true
    try {
      const res = await fetch('/api/sleep/today')
      const text = await res.text()
      todayData.value = text ? JSON.parse(text) : null
    } catch (e) {
      const today = new Date().toISOString().split('T')[0]
      todayData.value = mockData.find(d => d.date === today) || mockData[mockData.length - 1]
    }
    loading.value = false
  }

  async function fetchHistory(start?: string, end?: string) {
    loading.value = true
    try {
      let url = '/api/sleep'
      if (start || end) {
        const params = new URLSearchParams()
        if (start) params.append('start', start)
        if (end) params.append('end', end)
        url = `/api/sleep/stats/range?${params.toString()}`
      }
      const res = await fetch(url)
      const text = await res.text()
      historyData.value = text ? JSON.parse(text) : []
      if (historyData.value.length === 0) throw new Error('No data')
    } catch (e) {
      historyData.value = [...mockData]
    }
    loading.value = false
  }

  async function fetchReminders() {
    try {
      const res = await fetch('/api/reminders')
      const text = await res.text()
      const data = text ? JSON.parse(text) : []
      reminders.value = data.length > 0 ? data : [...mockReminders]
    } catch (e) {
      reminders.value = [...mockReminders]
    }
  }

  async function updateReminder(id: string, data: Partial<Reminder>) {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const updated = await res.json()
      const idx = reminders.value.findIndex(r => r.id === id)
      if (idx >= 0) reminders.value[idx] = updated
    } catch (e) {
      const idx = reminders.value.findIndex(r => r.id === id)
      if (idx >= 0) {
        reminders.value[idx] = { ...reminders.value[idx], ...data }
      }
    }
  }

  return {
    todayData,
    historyData,
    reminders,
    loading,
    avgScore,
    avgDuration,
    fetchToday,
    fetchHistory,
    fetchReminders,
    updateReminder
  }
})
