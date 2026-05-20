import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/system/Users';
import Roles from './pages/system/Roles';
import Departments from './pages/org/Departments';
import Employees from './pages/org/Employees';
import Indicators from './pages/kpi/Indicators';
import Schemes from './pages/kpi/Schemes';
import Plans from './pages/kpi/Plans';
import PersonalKpis from './pages/kpi/PersonalKpis';
import Results from './pages/kpi/Results';
import Statistics from './pages/statistics/Statistics';
import Logs from './pages/system/Logs';
import Configs from './pages/system/Configs';

function App() {
  const token = useAppStore((state) => state.token);

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/system/users" element={<Users />} />
        <Route path="/system/roles" element={<Roles />} />
        <Route path="/system/logs" element={<Logs />} />
        <Route path="/system/configs" element={<Configs />} />
        <Route path="/org/departments" element={<Departments />} />
        <Route path="/org/employees" element={<Employees />} />
        <Route path="/kpi/indicators" element={<Indicators />} />
        <Route path="/kpi/schemes" element={<Schemes />} />
        <Route path="/kpi/plans" element={<Plans />} />
        <Route path="/kpi/personal" element={<PersonalKpis />} />
        <Route path="/kpi/results" element={<Results />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
