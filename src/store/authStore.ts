import { create } from 'zustand'
import { User } from '@/types'
import { api } from '@/services/api'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
      login: async (username: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { username, password })
          const { user, token, permissions } = response.data
          set({
            user,
            token,
            isAuthenticated: true,
            permissions,
          })
          return true
        } catch {
          return false
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
        })
      },
      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface GlobalState {
  sidebarCollapsed: boolean
  currentModule: string
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentModule: (module: string) => void
}

export const useGlobalStore = create<GlobalState>((set) => ({
  sidebarCollapsed: false,
  currentModule: 'dashboard',
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentModule: (module) => set({ currentModule: module }),
}))
