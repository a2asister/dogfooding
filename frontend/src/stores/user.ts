import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  syncDirectory: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => !!user.value)

  async function checkAuth() {
    try {
      const response = await api.get('/auth/check')
      if (response.data.data.authenticated) {
        const userResponse = await api.get('/auth/me')
        user.value = userResponse.data.data
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      isInitialized.value = true
    }
  }

  async function login(username: string, password: string) {
    const response = await api.post('/auth/login', { username, password })
    user.value = response.data.data
    return response.data
  }

  async function logout() {
    await api.post('/auth/logout')
    user.value = null
  }

  async function register(username: string, password: string, email: string) {
    const response = await api.post('/users/register', { username, password, email })
    return response.data
  }

  async function updateProfile(updates: Partial<User>) {
    const response = await api.put('/users/profile', updates)
    user.value = response.data.data
    return response.data
  }

  return {
    user,
    isInitialized,
    isAuthenticated,
    checkAuth,
    login,
    logout,
    register,
    updateProfile,
  }
})
