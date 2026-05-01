import type {
  SleepRecord,
  FeedingRecord,
  VaccineRecord,
  CheckupRecord,
  GrowthRecord,
  DiaryEntry,
  PhotoAlbum,
  Reminder,
  HealthAlert,
  Milestone,
} from '@/types'
import { storageService } from './storage'

export class RecordService {
  private static instance: RecordService

  private constructor() {}

  static getInstance(): RecordService {
    if (!RecordService.instance) {
      RecordService.instance = new RecordService()
    }
    return RecordService.instance
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getSleepRecords(babyId?: string): SleepRecord[] {
    const data = storageService.getData()
    let records = [...data.sleepRecords]
    
    if (babyId) {
      records = records.filter(r => r.babyId === babyId)
    }
    
    return records.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }

  createSleepRecord(record: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'>): SleepRecord {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newRecord: SleepRecord = {
      ...record,
      id: this.generateId('sleep'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.sleepRecords.push(newRecord)
    storageService.saveData()
    
    return newRecord
  }

  updateSleepRecord(id: string, updates: Partial<Omit<SleepRecord, 'id' | 'createdAt'>>): SleepRecord | null {
    const data = storageService.getData()
    const index = data.sleepRecords.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.sleepRecords[index] = {
      ...data.sleepRecords[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.sleepRecords[index] }
  }

  deleteSleepRecord(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.sleepRecords.length
    data.sleepRecords = data.sleepRecords.filter(r => r.id !== id)
    
    if (data.sleepRecords.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getFeedingRecords(babyId?: string): FeedingRecord[] {
    const data = storageService.getData()
    let records = [...data.feedingRecords]
    
    if (babyId) {
      records = records.filter(r => r.babyId === babyId)
    }
    
    return records.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }

  createFeedingRecord(record: Omit<FeedingRecord, 'id' | 'createdAt' | 'updatedAt'>): FeedingRecord {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newRecord: FeedingRecord = {
      ...record,
      id: this.generateId('feeding'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.feedingRecords.push(newRecord)
    storageService.saveData()
    
    return newRecord
  }

  updateFeedingRecord(id: string, updates: Partial<Omit<FeedingRecord, 'id' | 'createdAt'>>): FeedingRecord | null {
    const data = storageService.getData()
    const index = data.feedingRecords.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.feedingRecords[index] = {
      ...data.feedingRecords[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.feedingRecords[index] }
  }

  deleteFeedingRecord(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.feedingRecords.length
    data.feedingRecords = data.feedingRecords.filter(r => r.id !== id)
    
    if (data.feedingRecords.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getVaccineRecords(babyId?: string): VaccineRecord[] {
    const data = storageService.getData()
    let records = [...data.vaccineRecords]
    
    if (babyId) {
      records = records.filter(r => r.babyId === babyId)
    }
    
    return records.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    )
  }

  createVaccineRecord(record: Omit<VaccineRecord, 'id' | 'createdAt' | 'updatedAt'>): VaccineRecord {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newRecord: VaccineRecord = {
      ...record,
      id: this.generateId('vaccine'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.vaccineRecords.push(newRecord)
    storageService.saveData()
    
    return newRecord
  }

  updateVaccineRecord(id: string, updates: Partial<Omit<VaccineRecord, 'id' | 'createdAt'>>): VaccineRecord | null {
    const data = storageService.getData()
    const index = data.vaccineRecords.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.vaccineRecords[index] = {
      ...data.vaccineRecords[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.vaccineRecords[index] }
  }

  deleteVaccineRecord(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.vaccineRecords.length
    data.vaccineRecords = data.vaccineRecords.filter(r => r.id !== id)
    
    if (data.vaccineRecords.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getCheckupRecords(babyId?: string): CheckupRecord[] {
    const data = storageService.getData()
    let records = [...data.checkupRecords]
    
    if (babyId) {
      records = records.filter(r => r.babyId === babyId)
    }
    
    return records.sort((a, b) => 
      new Date(b.checkupDate).getTime() - new Date(a.checkupDate).getTime()
    )
  }

  createCheckupRecord(record: Omit<CheckupRecord, 'id' | 'createdAt' | 'updatedAt'>): CheckupRecord {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newRecord: CheckupRecord = {
      ...record,
      id: this.generateId('checkup'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.checkupRecords.push(newRecord)
    storageService.saveData()
    
    return newRecord
  }

  updateCheckupRecord(id: string, updates: Partial<Omit<CheckupRecord, 'id' | 'createdAt'>>): CheckupRecord | null {
    const data = storageService.getData()
    const index = data.checkupRecords.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.checkupRecords[index] = {
      ...data.checkupRecords[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.checkupRecords[index] }
  }

  deleteCheckupRecord(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.checkupRecords.length
    data.checkupRecords = data.checkupRecords.filter(r => r.id !== id)
    
    if (data.checkupRecords.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getGrowthRecords(babyId?: string): GrowthRecord[] {
    const data = storageService.getData()
    let records = [...data.growthRecords]
    
    if (babyId) {
      records = records.filter(r => r.babyId === babyId)
    }
    
    return records.sort((a, b) => 
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    )
  }

  createGrowthRecord(record: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt'>): GrowthRecord {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newRecord: GrowthRecord = {
      ...record,
      id: this.generateId('growth'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.growthRecords.push(newRecord)
    storageService.saveData()
    
    return newRecord
  }

  updateGrowthRecord(id: string, updates: Partial<Omit<GrowthRecord, 'id' | 'createdAt'>>): GrowthRecord | null {
    const data = storageService.getData()
    const index = data.growthRecords.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.growthRecords[index] = {
      ...data.growthRecords[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.growthRecords[index] }
  }

  deleteGrowthRecord(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.growthRecords.length
    data.growthRecords = data.growthRecords.filter(r => r.id !== id)
    
    if (data.growthRecords.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getDiaryEntries(babyId?: string): DiaryEntry[] {
    const data = storageService.getData()
    let entries = [...data.diaryEntries]
    
    if (babyId) {
      entries = entries.filter(e => e.babyId === babyId)
    }
    
    return entries.sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )
  }

  createDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): DiaryEntry {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newEntry: DiaryEntry = {
      ...entry,
      id: this.generateId('diary'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.diaryEntries.push(newEntry)
    storageService.saveData()
    
    return newEntry
  }

  updateDiaryEntry(id: string, updates: Partial<Omit<DiaryEntry, 'id' | 'createdAt'>>): DiaryEntry | null {
    const data = storageService.getData()
    const index = data.diaryEntries.findIndex(e => e.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.diaryEntries[index] = {
      ...data.diaryEntries[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.diaryEntries[index] }
  }

  deleteDiaryEntry(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.diaryEntries.length
    data.diaryEntries = data.diaryEntries.filter(e => e.id !== id)
    
    if (data.diaryEntries.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getPhotoAlbums(babyId?: string): PhotoAlbum[] {
    const data = storageService.getData()
    let albums = [...data.photoAlbums]
    
    if (babyId) {
      albums = albums.filter(a => a.babyId === babyId)
    }
    
    return albums.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  createPhotoAlbum(album: Omit<PhotoAlbum, 'id' | 'createdAt' | 'updatedAt'>): PhotoAlbum {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newAlbum: PhotoAlbum = {
      ...album,
      id: this.generateId('album'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.photoAlbums.push(newAlbum)
    storageService.saveData()
    
    return newAlbum
  }

  updatePhotoAlbum(id: string, updates: Partial<Omit<PhotoAlbum, 'id' | 'createdAt'>>): PhotoAlbum | null {
    const data = storageService.getData()
    const index = data.photoAlbums.findIndex(a => a.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.photoAlbums[index] = {
      ...data.photoAlbums[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.photoAlbums[index] }
  }

  deletePhotoAlbum(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.photoAlbums.length
    data.photoAlbums = data.photoAlbums.filter(a => a.id !== id)
    
    if (data.photoAlbums.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getReminders(babyId?: string): Reminder[] {
    const data = storageService.getData()
    let reminders = [...data.reminders]
    
    if (babyId) {
      reminders = reminders.filter(r => r.babyId === babyId)
    }
    
    return reminders.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    )
  }

  createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newReminder: Reminder = {
      ...reminder,
      id: this.generateId('reminder'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.reminders.push(newReminder)
    storageService.saveData()
    
    return newReminder
  }

  updateReminder(id: string, updates: Partial<Omit<Reminder, 'id' | 'createdAt'>>): Reminder | null {
    const data = storageService.getData()
    const index = data.reminders.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.reminders[index] = {
      ...data.reminders[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.reminders[index] }
  }

  deleteReminder(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.reminders.length
    data.reminders = data.reminders.filter(r => r.id !== id)
    
    if (data.reminders.length === initialLength) return false
    
    storageService.saveData()
    return true
  }

  getHealthAlerts(babyId?: string): HealthAlert[] {
    const data = storageService.getData()
    let alerts = [...data.healthAlerts]
    
    if (babyId) {
      alerts = alerts.filter(a => a.babyId === babyId)
    }
    
    return alerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt'>): HealthAlert {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newAlert: HealthAlert = {
      ...alert,
      id: this.generateId('alert'),
      createdAt: now,
    }
    
    data.healthAlerts.push(newAlert)
    storageService.saveData()
    
    return newAlert
  }

  acknowledgeHealthAlert(id: string): HealthAlert | null {
    const data = storageService.getData()
    const index = data.healthAlerts.findIndex(a => a.id === id)
    
    if (index === -1) return null
    
    data.healthAlerts[index] = {
      ...data.healthAlerts[index],
      isAcknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    }
    
    storageService.saveData()
    return { ...data.healthAlerts[index] }
  }

  getMilestones(babyId?: string): Milestone[] {
    const data = storageService.getData()
    let milestones = [...data.milestones]
    
    if (babyId) {
      milestones = milestones.filter(m => m.babyId === babyId)
    }
    
    return milestones.sort((a, b) => 
      a.expectedAgeMonths - b.expectedAgeMonths
    )
  }

  createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Milestone {
    const data = storageService.getData()
    const now = new Date().toISOString()
    
    const newMilestone: Milestone = {
      ...milestone,
      id: this.generateId('milestone'),
      createdAt: now,
      updatedAt: now,
    }
    
    data.milestones.push(newMilestone)
    storageService.saveData()
    
    return newMilestone
  }

  updateMilestone(id: string, updates: Partial<Omit<Milestone, 'id' | 'createdAt'>>): Milestone | null {
    const data = storageService.getData()
    const index = data.milestones.findIndex(m => m.id === id)
    
    if (index === -1) return null
    
    const now = new Date().toISOString()
    data.milestones[index] = {
      ...data.milestones[index],
      ...updates,
      updatedAt: now,
    }
    
    storageService.saveData()
    return { ...data.milestones[index] }
  }

  deleteMilestone(id: string): boolean {
    const data = storageService.getData()
    const initialLength = data.milestones.length
    data.milestones = data.milestones.filter(m => m.id !== id)
    
    if (data.milestones.length === initialLength) return false
    
    storageService.saveData()
    return true
  }
}

export const recordService = RecordService.getInstance()
