import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, register, refreshToken } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
    } else {
      localStorage.removeItem('token')
    }
  }

  const loginAction = async (credentials) => {
    try {
      const response = await login(credentials)
      setToken(response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const registerAction = async (data) => {
    try {
      const response = await register(data)
      setToken(response.token)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
  }

  const refreshTokenAction = async () => {
    if (!token.value) return false
    try {
      const response = await refreshToken(token.value)
      setToken(response.token)
      setUser(response.user)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  const hasRole = (role) => {
    if (!user.value || !user.value.roles) return false
    return user.value.roles.includes(role)
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    loginAction,
    registerAction,
    logout,
    refreshTokenAction,
    hasRole
  }
})
