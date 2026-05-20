import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HostMonitor from './pages/HostMonitor';
import ContainerMonitor from './pages/ContainerMonitor';
import AppMonitor from './pages/AppMonitor';
import LogSearch from './pages/LogSearch';
import AlertCenter from './pages/AlertCenter';
import SystemSettings from './pages/SystemSettings';
import { useAuthStore } from './store/auth';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {token ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hosts" element={<HostMonitor />} />
          <Route path="containers" element={<ContainerMonitor />} />
          <Route path="apps" element={<AppMonitor />} />
          <Route path="logs" element={<LogSearch />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
