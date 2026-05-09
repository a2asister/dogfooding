export interface SleepStage {
  type: 'deep' | 'light' | 'rem' | 'awake'
  duration: number
  startTime: number
}

export interface SleepData {
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

export interface Reminder {
  id: string
  type: 'sleep' | 'wake'
  time: string
  enabled: boolean
  label: string
}

export interface WhiteNoise {
  id: string
  name: string
  icon: string
  color: string
}
