import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: number
  username: string
  phone: string | null
  email: string | null
  avatar: string | null
  isVerified: boolean
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (credentials: { username: string; password: string }) => Promise<void>
  loginWithPhone: (phone: string, code: string) => Promise<void>
  register: (data: { username: string; password: string; phone?: string; email?: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,

      setUser: (user) => set({ user, isAdmin: user?.isAdmin || false }),
      setToken: (token) => {
        set({ token })
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          localStorage.setItem('token', token)
        } else {
          delete axios.defaults.headers.common['Authorization']
          localStorage.removeItem('token')
        }
      },

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/api/auth/login', credentials)
          const { user, token } = response.data.data
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.isAdmin,
            isLoading: false,
          })
          get().setToken(token)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      loginWithPhone: async (phone, code) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/api/auth/phone-login', { phone, code })
          const { user, token } = response.data.data
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.isAdmin,
            isLoading: false,
          })
          get().setToken(token)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/api/auth/register', data)
          const { user, token } = response.data.data
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.isAdmin,
            isLoading: false,
          })
          get().setToken(token)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        })
        get().setToken(null)
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false, user: null, isAdmin: false })
          return
        }

        try {
          const response = await axios.get('/api/auth/me')
          const user = response.data.data
          set({
            user,
            isAuthenticated: true,
            isAdmin: user.isAdmin,
          })
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
          })
          get().setToken(null)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
)
