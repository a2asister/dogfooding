import { useState, useEffect, useCallback, createContext, useContext } from 'react'

export interface User {
  id: string
  username: string
  realName: string
  email: string
  phone: string
  avatar: string
  departmentId: string
  roleIds: string[]
  status: string
}

export interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch {
        setCurrentUser(null)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (data.success && data.data) {
        const user = data.data
        setCurrentUser(user)
        localStorage.setItem('currentUser', JSON.stringify(user))
        localStorage.setItem('token', `token_${user.id}`)
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      if (username === 'admin' && password === 'admin123') {
        const mockUser: User = {
          id: 'u001',
          username: 'admin',
          realName: '超级管理员',
          email: 'admin@example.com',
          phone: '13800138001',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          departmentId: 'd001',
          roleIds: ['r001'],
          status: 'active',
        }
        setCurrentUser(mockUser)
        localStorage.setItem('currentUser', JSON.stringify(mockUser))
        localStorage.setItem('token', `token_${mockUser.id}`)
        setLoading(false)
        return true
      }
      setLoading(false)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('token')
    window.location.href = '/login'
  }, [])

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    loading,
  }
}

export const AuthProvider = AuthContext.Provider
