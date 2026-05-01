import type { BabyProfile } from '@/types'
import { storageService } from './storage'

export class BabyService {
  private static instance: BabyService

  private constructor() {}

  static getInstance(): BabyService {
    if (!BabyService.instance) {
      BabyService.instance = new BabyService()
    }
    return BabyService.instance
  }

  private generateId(): string {
    return `baby_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getAllBabies(): BabyProfile[] {
    const data = storageService.getData()
    return [...data.babies].sort((a, b) => 
      new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
    )
  }

  getBabyById(id: string): BabyProfile | undefined {
    const data = storageService.getData()
    return data.babies.find(baby => baby.id === id)
  }

  createBaby(baby: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): BabyProfile {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newBaby: BabyProfile = {
      ...baby,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }
    
    data.babies.push(newBaby)
    storageService.saveData()
    
    return newBaby
  }

  updateBaby(id: string, updates: Partial<Omit<BabyProfile, 'id' | 'createdAt'>>): BabyProfile | null {
    const data = storageService.getData()
    const babyIndex = data.babies.findIndex(baby => baby.id === id)
    
    if (babyIndex === -1) return null
    
    const now = new Date().toISOString()
    data.babies[babyIndex] = {
      ...data.babies[babyIndex],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.babies[babyIndex] }
  }

  deleteBaby(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.babies.length
    data.babies = data.babies.filter(baby => baby.id !== id)
    
    if (data.babies.length === initialLength) return false
    
    this.deleteBabyRelatedData(id)
    storageService.saveData()
    return true
  }

  private deleteBabyRelatedData(babyId: string): void {
    const data = storageService.getData()
    
    data.sleepRecords = data.sleepRecords.filter(r => r.babyId !== babyId)
    data.feedingRecords = data.feedingRecords.filter(r => r.babyId !== babyId)
    data.vaccineRecords = data.vaccineRecords.filter(r => r.babyId !== babyId)
    data.checkupRecords = data.checkupRecords.filter(r => r.babyId !== babyId)
    data.growthRecords = data.growthRecords.filter(r => r.babyId !== babyId)
    data.diaryEntries = data.diaryEntries.filter(r => r.babyId !== babyId)
    data.photoAlbums = data.photoAlbums.filter(r => r.babyId !== babyId)
    data.reminders = data.reminders.filter(r => r.babyId !== babyId)
    data.healthAlerts = data.healthAlerts.filter(r => r.babyId !== babyId)
    data.milestones = data.milestones.filter(r => r.babyId !== babyId)
    
    if (data.settings.defaultBabyId === babyId) {
      data.settings.defaultBabyId = undefined
    }
  }

  calculateAgeMonths(birthDate: string): number {
    const birth = new Date(birthDate)
    const now = new Date()
    
    let months = (now.getFullYear() - birth.getFullYear()) * 12
    months += now.getMonth() - birth.getMonth()
    
    const daysDiff = now.getDate() - birth.getDate()
    if (daysDiff < 0) {
      months--
    }
    
    return Math.max(0, months)
  }

  calculateAgeDays(birthDate: string): number {
    const birth = new Date(birthDate)
    const now = new Date()
    const diffTime = now.getTime() - birth.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  formatAge(birthDate: string): string {
    const months = this.calculateAgeMonths(birthDate)
    const days = this.calculateAgeDays(birthDate)
    
    if (months === 0) {
      return `${days} 天`
    }
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) {
      return `${months} 个月`
    }
    
    if (remainingMonths === 0) {
      return `${years} 岁`
    }
    
    return `${years} 岁 ${remainingMonths} 个月`
  }

  getDefaultBaby(): BabyProfile | undefined {
    const data = storageService.getData()
    const defaultBabyId = data.settings.defaultBabyId
    
    if (defaultBabyId) {
      return this.getBabyById(defaultBabyId)
    }
    
    const babies = this.getAllBabies()
    return babies[0]
  }

  setDefaultBaby(babyId: string): boolean {
    const baby = this.getBabyById(babyId)
    if (!baby) return false
    
    storageService.updateSettings({ defaultBabyId: babyId })
    return true
  }
}

export const babyService = BabyService.getInstance()
