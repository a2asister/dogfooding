import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import FlightManagement from '@/pages/FlightManagement'
import PassengerService from '@/pages/PassengerService'
import BaggageManagement from '@/pages/BaggageManagement'
import ResourceScheduling from '@/pages/ResourceScheduling'
import SecurityEmergency from '@/pages/SecurityEmergency'
import EquipmentMaintenance from '@/pages/EquipmentMaintenance'
import DataDecision from '@/pages/DataDecision'
import UserManagement from '@/pages/UserManagement'
import RoleManagement from '@/pages/RoleManagement'
import OperationLog from '@/pages/OperationLog'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="flight" element={<FlightManagement />} />
          <Route path="passenger" element={<PassengerService />} />
          <Route path="baggage" element={<BaggageManagement />} />
          <Route path="resource" element={<ResourceScheduling />} />
          <Route path="security" element={<SecurityEmergency />} />
          <Route path="equipment" element={<EquipmentMaintenance />} />
          <Route path="data" element={<DataDecision />} />
          <Route path="system/users" element={<UserManagement />} />
          <Route path="system/roles" element={<RoleManagement />} />
          <Route path="system/logs" element={<OperationLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
