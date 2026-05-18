import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mockAxios = new MockAdapter(axios)

vi.mock('../utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('API 封装', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.reset()
  })

  describe('newsApi', () => {
    it('应该导出 newsApi 对象', async () => {
      const { newsApi } = await import('./index')
      expect(newsApi).toBeDefined()
      expect(typeof newsApi.getList).toBe('function')
      expect(typeof newsApi.getLatest).toBe('function')
      expect(typeof newsApi.getDetail).toBe('function')
      expect(typeof newsApi.create).toBe('function')
      expect(typeof newsApi.update).toBe('function')
      expect(typeof newsApi.delete).toBe('function')
    })

    it('getList 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      const mockResponse = { list: [], total: 0 }
      request.get.mockResolvedValue(mockResponse)
      
      const result = await newsApi.getList({ page: 1, pageSize: 10 })
      expect(request.get).toHaveBeenCalledWith('/news', { params: { page: 1, pageSize: 10 } })
      expect(result).toEqual(mockResponse)
    })

    it('getLatest 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      const mockResponse = []
      request.get.mockResolvedValue(mockResponse)
      
      const result = await newsApi.getLatest(3)
      expect(request.get).toHaveBeenCalledWith('/news/latest', { params: { limit: 3 } })
      expect(result).toEqual(mockResponse)
    })

    it('getDetail 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      const mockResponse = { id: 1, title: 'Test' }
      request.get.mockResolvedValue(mockResponse)
      
      const result = await newsApi.getDetail(1)
      expect(request.get).toHaveBeenCalledWith('/news/1')
      expect(result).toEqual(mockResponse)
    })

    it('create 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      const mockData = { title: 'Test', content: 'Content' }
      request.post.mockResolvedValue({ id: 1 })
      
      const result = await newsApi.create(mockData)
      expect(request.post).toHaveBeenCalledWith('/news', mockData)
      expect(result).toEqual({ id: 1 })
    })

    it('update 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      const mockData = { title: 'Updated' }
      request.put.mockResolvedValue({ id: 1 })
      
      const result = await newsApi.update(1, mockData)
      expect(request.put).toHaveBeenCalledWith('/news/1', mockData)
      expect(result).toEqual({ id: 1 })
    })

    it('delete 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { newsApi } = await import('./index')
      
      request.delete.mockResolvedValue({ success: true })
      
      const result = await newsApi.delete(1)
      expect(request.delete).toHaveBeenCalledWith('/news/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('eventApi', () => {
    it('应该导出 eventApi 对象', async () => {
      const { eventApi } = await import('./index')
      expect(eventApi).toBeDefined()
      expect(typeof eventApi.getList).toBe('function')
      expect(typeof eventApi.getOngoing).toBe('function')
      expect(typeof eventApi.getAdminList).toBe('function')
    })

    it('getList 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { eventApi } = await import('./index')
      
      const mockResponse = { list: [], total: 0 }
      request.get.mockResolvedValue(mockResponse)
      
      const result = await eventApi.getList({ page: 1, pageSize: 10 })
      expect(request.get).toHaveBeenCalledWith('/events', { params: { page: 1, pageSize: 10 } })
      expect(result).toEqual(mockResponse)
    })

    it('getOngoing 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { eventApi } = await import('./index')
      
      const mockResponse = []
      request.get.mockResolvedValue(mockResponse)
      
      const result = await eventApi.getOngoing(3)
      expect(request.get).toHaveBeenCalledWith('/events/ongoing', { params: { limit: 3 } })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('uploadApi', () => {
    it('应该导出 uploadApi 对象', async () => {
      const { uploadApi } = await import('./index')
      expect(uploadApi).toBeDefined()
      expect(typeof uploadApi.uploadImage).toBe('function')
    })

    it('uploadImage 应该调用正确的接口', async () => {
      const { default: request } = await import('../utils/request')
      const { uploadApi } = await import('./index')
      
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = { url: 'https://example.com/test.jpg', filename: 'test.jpg' }
      request.post.mockResolvedValue(mockResponse)
      
      const result = await uploadApi.uploadImage(mockFile)
      expect(request.post).toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })
  })

  describe('其他 API', () => {
    it('应该导出 homeApi', async () => {
      const { homeApi } = await import('./index')
      expect(homeApi).toBeDefined()
      expect(typeof homeApi.getConfig).toBe('function')
      expect(typeof homeApi.getHomeData).toBe('function')
      expect(typeof homeApi.getAllConfig).toBe('function')
      expect(typeof homeApi.updateConfig).toBe('function')
    })

    it('应该导出 reservationApi', async () => {
      const { reservationApi } = await import('./index')
      expect(reservationApi).toBeDefined()
      expect(typeof reservationApi.create).toBe('function')
      expect(typeof reservationApi.getList).toBe('function')
      expect(typeof reservationApi.getStats).toBe('function')
    })

    it('应该导出 ticketApi', async () => {
      const { ticketApi } = await import('./index')
      expect(ticketApi).toBeDefined()
      expect(typeof ticketApi.create).toBe('function')
      expect(typeof ticketApi.getList).toBe('function')
      expect(typeof ticketApi.getDetail).toBe('function')
      expect(typeof ticketApi.reply).toBe('function')
      expect(typeof ticketApi.updateStatus).toBe('function')
    })

    it('应该导出 complianceApi', async () => {
      const { complianceApi } = await import('./index')
      expect(complianceApi).toBeDefined()
      expect(typeof complianceApi.getAll).toBe('function')
      expect(typeof complianceApi.getByType).toBe('function')
      expect(typeof complianceApi.update).toBe('function')
    })

    it('应该导出 settingApi', async () => {
      const { settingApi } = await import('./index')
      expect(settingApi).toBeDefined()
      expect(typeof settingApi.getAll).toBe('function')
      expect(typeof settingApi.getFullList).toBe('function')
      expect(typeof settingApi.update).toBe('function')
      expect(typeof settingApi.batchUpdate).toBe('function')
    })

    it('应该导出 adminApi', async () => {
      const { adminApi } = await import('./index')
      expect(adminApi).toBeDefined()
      expect(typeof adminApi.login).toBe('function')
      expect(typeof adminApi.getAll).toBe('function')
      expect(typeof adminApi.create).toBe('function')
    })
  })
})
