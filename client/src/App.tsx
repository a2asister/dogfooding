import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import OrderCreate from './pages/orders/OrderCreate';
import WaybillList from './pages/waybills/WaybillList';
import WaybillDetail from './pages/waybills/WaybillDetail';
import BranchList from './pages/branches/BranchList';
import VehicleList from './pages/vehicles/VehicleList';
import UserList from './pages/users/UserList';
import ExceptionList from './pages/exceptions/ExceptionList';
import ReturnList from './pages/returns/ReturnList';
import FeedbackList from './pages/feedbacks/FeedbackList';
import InventoryList from './pages/inventory/InventoryList';
import Reports from './pages/reports/Reports';
import Profile from './pages/Profile';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/create" element={<OrderCreate />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="waybills" element={<WaybillList />} />
        <Route path="waybills/:id" element={<WaybillDetail />} />
        <Route path="branches" element={<BranchList />} />
        <Route path="vehicles" element={<VehicleList />} />
        <Route path="users" element={<UserList />} />
        <Route path="exceptions" element={<ExceptionList />} />
        <Route path="returns" element={<ReturnList />} />
        <Route path="feedbacks" element={<FeedbackList />} />
        <Route path="inventory" element={<InventoryList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default App;
