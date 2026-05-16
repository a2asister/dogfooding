import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  username: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref(localStorage.getItem('token') || '')
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const setUser = (newUser: User) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return { user, token, setToken, setUser, logout }
})
