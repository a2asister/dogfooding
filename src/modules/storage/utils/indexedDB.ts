import type { RecordingInfo, RecordingChunk } from '@/types'

const DB_NAME = 'ScreenRecorderDB'
const DB_VERSION = 1
const INFO_STORE = 'recordingsInfo'
const CHUNKS_STORE = 'recordingChunks'

class IndexedDBService {
  private db: IDBDatabase | null = null

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(INFO_STORE)) {
          const infoStore = db.createObjectStore(INFO_STORE, { keyPath: 'id' })
          infoStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
          const chunksStore = db.createObjectStore(CHUNKS_STORE, { keyPath: 'id' })
          chunksStore.createIndex('recordingId', 'recordingId', { unique: false })
          chunksStore.createIndex('index', 'index', { unique: false })
        }
      }
    })
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      return this.init()
    }
    return this.db
  }

  async saveRecordingInfo(info: RecordingInfo): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INFO_STORE], 'readwrite')
      const store = transaction.objectStore(INFO_STORE)
      const request = store.put(info)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async saveChunk(chunk: Omit<RecordingChunk, 'id'>): Promise<void> {
    const db = await this.getDB()
    const chunkWithId: RecordingChunk = {
      ...chunk,
      id: `${chunk.recordingId}-${chunk.index}`
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHUNKS_STORE], 'readwrite')
      const store = transaction.objectStore(CHUNKS_STORE)
      const request = store.put(chunkWithId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllRecordings(): Promise<RecordingInfo[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INFO_STORE], 'readonly')
      const store = transaction.objectStore(INFO_STORE)
      const index = store.index('createdAt')
      const request = index.openCursor(null, 'prev')

      const recordings: RecordingInfo[] = []

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          recordings.push(cursor.value)
          cursor.continue()
        } else {
          resolve(recordings)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async getRecordingInfo(id: string): Promise<RecordingInfo | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INFO_STORE], 'readonly')
      const store = transaction.objectStore(INFO_STORE)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getChunks(recordingId: string): Promise<RecordingChunk[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHUNKS_STORE], 'readonly')
      const store = transaction.objectStore(CHUNKS_STORE)
      const index = store.index('recordingId')
      const request = index.getAll(recordingId)

      request.onsuccess = () => {
        const chunks = request.result.sort((a, b) => a.index - b.index)
        resolve(chunks)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteRecording(id: string): Promise<void> {
    const db = await this.getDB()

    await this.deleteChunks(id)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INFO_STORE], 'readwrite')
      const store = transaction.objectStore(INFO_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteChunks(recordingId: string): Promise<void> {
    const db = await this.getDB()
    const chunks = await this.getChunks(recordingId)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CHUNKS_STORE], 'readwrite')
      const store = transaction.objectStore(CHUNKS_STORE)

      chunks.forEach(chunk => {
        store.delete(chunk.id)
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getUsedStorage(): Promise<number> {
    const recordings = await this.getAllRecordings()
    return recordings.reduce((total, r) => total + r.size, 0)
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

export const indexedDBService = new IndexedDBService()
