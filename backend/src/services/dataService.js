import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, '../../data')
const dataFile = path.join(dataDir, 'app_data.json')

const defaultData = {
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
  settings: {
    theme: 'auto',
    language: 'zh-CN',
    notifications: {
      enabled: true,
      vaccineReminders: true,
      checkupReminders: true,
      dailySummary: true
    },
    measurementUnits: {
      weight: 'kg',
      height: 'cm',
      temperature: 'celsius'
    },
    autoExport: {
      enabled: false,
      interval: 'weekly'
    }
  }
}

const ensureDataDir = async () => {
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
    logger.info('Data directory created', { path: dataDir })
  }
}

const ensureDataFile = async () => {
  await ensureDataDir()
  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultData, null, 2), 'utf8')
    logger.info('Data file created with default data')
  }
}

export const dataService = {
  async getAll() {
    await ensureDataFile()
    const rawData = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(rawData)
  },

  async saveAll(data) {
    await ensureDataDir()
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8')
    logger.debug('Data saved to file')
  },

  async getSettings() {
    const data = await this.getAll()
    return data.settings
  },

  async updateSettings(updates) {
    const data = await this.getAll()
    data.settings = {
      ...data.settings,
      ...updates
    }
    await this.saveAll(data)
    logger.info('Settings updated')
    return data.settings
  },

  async exportToJSON() {
    const data = await this.getAll()
    return JSON.stringify(data, null, 2)
  },

  async importFromJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString)
      
      const requiredFields = ['babies', 'sleepRecords', 'feedingRecords', 'settings']
      const isValid = requiredFields.every(field => Array.isArray(imported[field] || imported[field] === undefined))
      
      if (!isValid) {
        throw new Error('Invalid data structure')
      }
      
      await this.saveAll(imported)
      logger.info('Data imported successfully')
      return true
    } catch (error) {
      logger.error('Failed to import data', { error: error.message })
      return false
    }
  }
}

export default dataService
