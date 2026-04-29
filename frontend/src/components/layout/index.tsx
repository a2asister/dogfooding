import React, { Suspense, useEffect } from 'react'
import { Layout as AntLayout } from 'antd'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'

const { Content } = AntLayout

const Layout: React.FC = () => {
  const location = useLocation()
  const { currentProject, fetchProjects } = useProjectStore()
  const { currentUser } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()

  useEffect(() => {
    if (currentUser) {
      fetchProjects()
    }
  }, [currentUser, fetchProjects])

  const isProjectPage = location.pathname.startsWith('/projects/') && !location.pathname.match(/\/projects\/?$/)
  const showSidebar = !['/login', '/404'].includes(location.pathname)

  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  const sidebarWidth = sidebarCollapsed ? 80 : 240
  const headerHeight = 64

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {showSidebar && <Sidebar />}
      <AntLayout
        style={{
          marginLeft: showSidebar ? sidebarWidth : 0,
          minHeight: '100vh',
          transition: 'margin-left 0.2s ease',
        }}
      >
        {showSidebar && (
          <div style={{ position: 'fixed', top: 0, left: sidebarWidth, right: 0, zIndex: 100 }}>
            <Header />
          </div>
        )}
        <Content
          style={{
            marginTop: showSidebar ? headerHeight + 24 : 24,
            marginLeft: 24,
            marginRight: 24,
            marginBottom: 24,
            padding: 0,
            background: '#f5f5f5',
            minHeight: 280,
          }}
        >
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>}>
            <Outlet />
          </Suspense>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
