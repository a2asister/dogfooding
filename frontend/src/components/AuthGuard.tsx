import { Navigate, Outlet } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, token, checkAuth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        await checkAuth()
      }
      setIsChecking(false)
    }
    verifyAuth()
  }, [token, checkAuth])

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default AuthGuard
