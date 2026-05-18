import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mockAxios = new MockAdapter(axios)

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

describe('request 工具函数', () => {
  beforeEach(() => {
    mockAxios.reset()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockAxios.restore()
  })

  it('应该导出 axios 实例', async () => {
    const { default: request } = await import('./request')
    expect(request).toBeDefined()
    expect(typeof request.get).toBe('function')
  })

  it('应该包含基础配置', async () => {
    const { default: request } = await import('./request')
    expect(request.defaults.baseURL).toBeDefined()
    expect(request.defaults.timeout).toBeDefined()
  })
})
