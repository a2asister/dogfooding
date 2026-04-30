import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (username, password) => {
        try {
          const response = await authApi.login(username, password)
          const { token, user } = response.data.data
          
          set({
            token,
            user,
            isAuthenticated: true
          })
          
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || '登录失败' 
          }
        }
      },
      
      register: async (username, password, email) => {
        try {
          await authApi.register(username, password, email)
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || '注册失败' 
          }
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },
      
      getCurrentUser: async () => {
        try {
          const response = await authApi.getCurrentUser()
          const user = response.data.data
          
          set({ user })
          return { success: true, user }
        } catch (error) {
          if (error.response?.status === 401) {
            get().logout()
          }
          return { success: false }
        }
      },
      
      changePassword: async (oldPassword, newPassword) => {
        try {
          await authApi.changePassword(oldPassword, newPassword)
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || '修改密码失败' 
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)

export { useAuthStore }