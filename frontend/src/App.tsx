import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import Login from '@/pages/Login'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Groups from '@/pages/Groups'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import Apis from '@/pages/Apis'
import ApiEditor from '@/pages/ApiEditor'
import LoginLogs from '@/pages/LoginLogs'
import Profile from '@/pages/Profile'
import { Role } from '@/types'

function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.GROUP_ADMIN]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="groups"
          element={
            <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.GROUP_ADMIN]}>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/apis" element={<Apis />} />
        <Route path="projects/:id/apis/new" element={<ApiEditor />} />
        <Route path="projects/:id/apis/:apiId" element={<ApiEditor />} />
        <Route
          path="logs/login"
          element={
            <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
              <LoginLogs />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<Profile />} />
        <Route path="403" element={<div style={{ padding: 50, textAlign: 'center' }}>403 权限不足</div>} />
      </Route>
      <Route path="*" element={<div style={{ padding: 50, textAlign: 'center' }}>404 页面不存在</div>} />
    </Routes>
  )
}
