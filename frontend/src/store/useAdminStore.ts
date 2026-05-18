import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const isLoggedIn = ref(false)
  const adminInfo = ref<{ id: number; username: string; role: string } | null>(null)

  const login = (info: { id: number; username: string; role: string }) => {
    isLoggedIn.value = true
    adminInfo.value = info
    localStorage.setItem('adminInfo', JSON.stringify(info))
  }

  const logout = () => {
    isLoggedIn.value = false
    adminInfo.value = null
    localStorage.removeItem('adminInfo')
  }

  const initFromStorage = () => {
    const stored = localStorage.getItem('adminInfo')
    if (stored) {
      try {
        const info = JSON.parse(stored)
        isLoggedIn.value = true
        adminInfo.value = info
      } catch {
        localStorage.removeItem('adminInfo')
      }
    }
  }

  return {
    isLoggedIn,
    adminInfo,
    login,
    logout,
    initFromStorage
  }
})
