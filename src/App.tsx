import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import VehicleManagement from './pages/VehicleManagement';
import DriverManagement from './pages/DriverManagement';
import OrderDispatch from './pages/OrderDispatch';
import TripMonitoring from './pages/TripMonitoring';
import DispatchConfig from './pages/DispatchConfig';
import PassengerOrders from './pages/PassengerOrders';
import OperationReports from './pages/OperationReports';
import MessageAlerts from './pages/MessageAlerts';
import SystemPermissions from './pages/SystemPermissions';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<VehicleManagement />} />
        <Route path="/drivers" element={<DriverManagement />} />
        <Route path="/orders" element={<OrderDispatch />} />
        <Route path="/trips" element={<TripMonitoring />} />
        <Route path="/config" element={<DispatchConfig />} />
        <Route path="/passengers" element={<PassengerOrders />} />
        <Route path="/reports" element={<OperationReports />} />
        <Route path="/alerts" element={<MessageAlerts />} />
        <Route path="/permissions" element={<SystemPermissions />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
