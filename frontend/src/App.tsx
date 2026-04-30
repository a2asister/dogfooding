import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Games from './pages/Games'
import GiftDetail from './pages/GiftDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import MyGifts from './pages/MyGifts'
import AdminDashboard from './pages/admin/Dashboard'
import AdminGifts from './pages/admin/Gifts'
import AdminGames from './pages/admin/Games'
import AdminUsers from './pages/admin/Users'
import AdminLogs from './pages/admin/Logs'
import AdminStatistics from './pages/admin/Statistics'
import { useAuthStore } from './stores/authStore'
import axios from 'axios'

function App() {
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    }
    setLoading(false)
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:gameId" element={<Games />} />
        <Route path="/gifts/:giftId" element={<GiftDetail />} />
        
        {!isAuthenticated && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        )}
        
        {isAuthenticated && (
          <>
            <Route path="/my-gifts" element={<MyGifts />} />
          </>
        )}
        
        {isAuthenticated && isAdmin && (
          <>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/gifts" element={<AdminGifts />} />
            <Route path="/admin/games" element={<AdminGames />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/statistics" element={<AdminStatistics />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
