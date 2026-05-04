import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(null)
  const user = ref(null)
  const isQiankun = ref(false)
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  function setToken(newToken) {
    token.value = newToken
  }
  
  function setUser(newUser) {
    user.value = newUser
  }
  
  function setQiankun(flag) {
    isQiankun.value = flag
  }
  
  function hasPermission(permission) {
    if (!user.value || !user.value.permissions) return false
    
    return user.value.permissions.some(p => {
      if (p === '*') return true
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -1)
        return permission.startsWith(prefix)
      }
      return p === permission
    })
  }
  
  function reset() {
    token.value = null
    user.value = null
  }
  
  return {
    token,
    user,
    isQiankun,
    isAuthenticated,
    setToken,
    setUser,
    setQiankun,
    hasPermission,
    reset
  }
})
