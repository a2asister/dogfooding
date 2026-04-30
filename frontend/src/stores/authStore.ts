import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      initAuth: () => {
        const { token } = get()
        if (token) {
          set({ isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
