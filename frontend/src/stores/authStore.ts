import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CurrentUser, LoginCredentials } from '@/types'
import { db } from '@/db'
import { sleep } from '@/utils'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  currentUser: CurrentUser | null
  token: string | null
  error: string | null
  
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      currentUser: null,
      token: null,
      error: null,

      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null })
        
        try {
          await sleep(500)
          
          const users = await db.users
            .where('username')
            .equals(credentials.username)
            .toArray()
          
          const user = users[0]
          
          if (!user || user.password !== credentials.password) {
            set({ 
              isLoading: false, 
              error: '用户名或密码错误',
              isAuthenticated: false 
            })
            return false
          }

          if (!user.isActive) {
            set({ 
              isLoading: false, 
              error: '账户已被禁用',
              isAuthenticated: false 
            })
            return false
          }

          const role = await db.roles.get(user.roleId)
          const permissions = role ? await db.permissions
            .where('id')
            .anyOf(role.permissionIds)
            .toArray() : []

          const currentUser: CurrentUser = {
            ...user,
            permissions: permissions.map(p => p.key),
          }

          const token = `token_${Date.now()}_${user.id}`

          set({
            isAuthenticated: true,
            isLoading: false,
            currentUser,
            token,
            error: null,
          })

          return true
        } catch (error) {
          console.error('Login error:', error)
          set({ 
            isLoading: false, 
            error: '登录失败，请稍后重试',
            isAuthenticated: false 
          })
          return false
        }
      },

      logout: async (): Promise<void> => {
        set({
          isAuthenticated: false,
          isLoading: false,
          currentUser: null,
          token: null,
          error: null,
        })
        
        localStorage.removeItem('auth-store')
      },

      checkAuth: async (): Promise<boolean> => {
        const { token, currentUser, isAuthenticated } = get()
        
        if (!isAuthenticated || !token || !currentUser) {
          return false
        }

        try {
          const user = await db.users.get(currentUser.id)
          
          if (!user || !user.isActive) {
            set({ isAuthenticated: false, currentUser: null, token: null })
            return false
          }

          return true
        } catch (error) {
          console.error('Auth check error:', error)
          return false
        }
      },

      updateProfile: async (updates: Partial<User>): Promise<void> => {
        const { currentUser } = get()
        
        if (!currentUser) return

        try {
          const updatedUser: User = {
            ...currentUser,
            ...updates,
            updatedAt: new Date(),
          }

          await db.users.put(updatedUser)

          set({
            currentUser: {
              ...updatedUser,
              permissions: currentUser.permissions,
            },
          })
        } catch (error) {
          console.error('Update profile error:', error)
          set({ error: '更新个人信息失败' })
        }
      },

      clearError: (): void => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        token: state.token,
      }),
    }
  )
)

export default useAuthStore
