import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import WorkflowList from './pages/WorkflowList'
import WorkflowEditor from './pages/WorkflowEditor'
import WorkflowDetails from './pages/WorkflowDetails'
import Schedule from './pages/Schedule'
import Events from './pages/Events'

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflows/:id/edit" element={<WorkflowEditor />} />
          <Route path="/workflows/:id" element={<WorkflowDetails />} />
          <Route path="/scheduler" element={<Schedule />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

const Layout = ({ children }) => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState('workflows')

  const navItems = [
    { id: 'workflows', label: '流程管理', icon: '📋', path: '/workflows' },
    { id: 'scheduler', label: '定时任务', icon: '⏰', path: '/scheduler' },
    { id: 'events', label: '事件管理', icon: '📡', path: '/events' }
  ]

  const handleNavClick = (item) => {
    setCurrentPage(item.id)
    navigate(item.path)
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>⚡ 流程编排平台</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default App