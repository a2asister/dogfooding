import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { describe, beforeEach, it, expect, vi } from 'vitest'

describe('useUserStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default values', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(store.toasts).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.isLoggedIn).toBe(false)
  })

  it('should set token correctly', () => {
    const store = useUserStore()
    const token = 'test-token-123'
    store.setToken(token)
    expect(store.token).toBe(token)
    expect(localStorage.getItem('token')).toBe(token)
  })

  it('should set user correctly', () => {
    const store = useUserStore()
    const user = { id: 1, username: 'testuser' }
    store.setUser(user)
    expect(store.user).toEqual(user)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user))
  })

  it('should have correct isLoggedIn computed value', () => {
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)
    store.setToken('test-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('should add toast and remove after timeout', () => {
    const store = useUserStore()
    store.showToast('success', 'Test message')
    expect(store.toasts.length).toBe(1)
    expect(store.toasts[0].type).toBe('success')
    expect(store.toasts[0].message).toBe('Test message')
    
    vi.advanceTimersByTime(3000)
    expect(store.toasts.length).toBe(0)
  })

  it('should handle multiple toasts', () => {
    const store = useUserStore()
    store.showToast('success', 'Success message')
    store.showToast('error', 'Error message')
    expect(store.toasts.length).toBe(2)
    
    vi.advanceTimersByTime(3000)
    expect(store.toasts.length).toBe(0)
  })

  it('should clear user and token on logout', () => {
    const store = useUserStore()
    store.setToken('test-token')
    store.setUser({ id: 1, username: 'testuser' })
    expect(store.isLoggedIn).toBe(true)
    expect(store.user).not.toBeNull()
    
    store.logout()
    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('should set loading state', () => {
    const store = useUserStore()
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('should parse saved user from localStorage on initialization', () => {
    const savedUser = { id: 2, username: 'saveduser' }
    localStorage.setItem('user', JSON.stringify(savedUser))
    localStorage.setItem('token', 'saved-token')
    
    setActivePinia(createPinia())
    const store = useUserStore()
    
    expect(store.user).toEqual(savedUser)
    expect(store.token).toBe('saved-token')
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('user', 'invalid-json')
    setActivePinia(createPinia())
    const store = useUserStore()
    expect(store.user).toBeNull()
  })
})
