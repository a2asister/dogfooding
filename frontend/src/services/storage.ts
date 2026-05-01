import type { AppData, AppSettings } from '@/types'

const STORAGE_KEY = 'baby_management_system_data'

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'zh-CN',
  notifications: {
    enabled: true,
    vaccineReminders: true,
    checkupReminders: true,
    dailySummary: true,
  },
  measurementUnits: {
    weight: 'kg',
    height: 'cm',
    temperature: 'celsius',
  },
  autoExport: {
    enabled: false,
    interval: 'weekly',
  },
}

const defaultAppData: AppData = {
  babies: [],
  sleepRecords: [],
  feedingRecords: [],
  vaccineRecords: [],
  checkupRecords: [],
  growthRecords: [],
  diaryEntries: [],
  photoAlbums: [],
  reminders: [],
  healthAlerts: [],
  milestones: [],
  settings: defaultSettings,
}

export class StorageService {
  private static instance: StorageService
  private data: AppData

  private constructor() {
    this.data = this.loadData()
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  private loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...defaultAppData, ...parsed }
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
    return { ...defaultAppData }
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
      console.log('Data saved to localStorage')
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
      throw error
    }
  }

  getData(): AppData {
    return { ...this.data }
  }

  getSettings(): AppSettings {
    return { ...this.data.settings }
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
    }
    this.saveData()
    return this.getSettings()
  }

  exportToJSON(): string {
    return JSON.stringify(this.data, null, 2)
  }

  importFromJSON(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as AppData
      if (!this.validateImportedData(imported)) {
        throw new Error('Invalid data structure')
      }
      this.data = imported
      this.saveData()
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  private validateImportedData(data: unknown): data is AppData {
    if (typeof data !== 'object' || data === null) return false
    
    const obj = data as Record<string, unknown>
    
    return (
      Array.isArray(obj.babies) &&
      Array.isArray(obj.sleepRecords) &&
      Array.isArray(obj.feedingRecords) &&
      Array.isArray(obj.vaccineRecords) &&
      Array.isArray(obj.checkupRecords) &&
      Array.isArray(obj.growthRecords) &&
      Array.isArray(obj.diaryEntries) &&
      Array.isArray(obj.photoAlbums) &&
      Array.isArray(obj.reminders) &&
      Array.isArray(obj.healthAlerts) &&
      Array.isArray(obj.milestones) &&
      typeof obj.settings === 'object'
    )
  }

  downloadJSON(filename: string = 'baby_management_data.json'): void {
    const jsonString = this.exportToJSON()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  resetData(): void {
    this.data = { ...defaultAppData }
    this.saveData()
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY)
    this.data = { ...defaultAppData }
  }

  getStorageInfo(): {
    used: number
    available: number
    total: number
  } {
    const used = new Blob([JSON.stringify(this.data)]).size
    const total = 5 * 1024 * 1024
    const available = total - used
    
    return { used, available, total }
  }
}

export const storageService = StorageService.getInstance()
