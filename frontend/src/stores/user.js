import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const permissions = ref([])
  const isAuthenticated = ref(false)

  const hasPermission = (permission) => {
    if (!permissions.value || permissions.value.length === 0) return false
    return permissions.value.includes(permission)
  }

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  const isManager = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'manager'
  })

  const setUser = (userData) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const setPermissions = (perms) => {
    permissions.value = perms
  }

  const logout = () => {
    user.value = null
    permissions.value = []
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      if (response.data) {
        setUser(response.data)
        setPermissions(response.data.permissions || [])
        return response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
    }
    return null
  }

  return {
    user,
    permissions,
    isAuthenticated,
    isAdmin,
    isManager,
    setUser,
    setPermissions,
    logout,
    fetchCurrentUser,
    hasPermission
  }
})
