import { Routes, Route } from 'react-router-dom'
import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Menu from '@/pages/Menu'
import Cart from '@/pages/Cart'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Login from '@/pages/Login'
import AdminLogin from '@/pages/admin/Login'
import AdminLayout from '@/pages/admin/Layout'
import AdminDashboard from '@/pages/admin/Dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'

function App() {
  const { initAuth } = useAuthStore()

  React.useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
      </Route>

      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
