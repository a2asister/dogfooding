import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/useStore';
import { userApi } from './services/api';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/user/Home';
import AuctionDetail from './pages/user/AuctionDetail';
import Profile from './pages/user/Profile';
import Deposit from './pages/user/Deposit';
import Orders from './pages/user/Orders';
import Favorites from './pages/user/Favorites';
import Messages from './pages/user/Messages';
import MerchantAuth from './pages/merchant/MerchantAuth';
import MerchantAuctions from './pages/merchant/MerchantAuctions';
import MerchantAuctionForm from './pages/merchant/MerchantAuctionForm';
import MerchantOrders from './pages/merchant/MerchantOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import MerchantManagement from './pages/admin/MerchantManagement';
import AuctionManagement from './pages/admin/AuctionManagement';
import OrderManagement from './pages/admin/OrderManagement';
import SystemConfig from './pages/admin/SystemConfig';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import OperatorAuctions from './pages/operator/OperatorAuctions';
import OperatorOrders from './pages/operator/OperatorOrders';

function App(): JSX.Element {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      userApi.getProfile().then((user) => setUser(user)).catch(() => {
        useAuthStore.getState().logout();
      });
    }
  }, [token, setUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="auction/:id" element={<AuctionDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="orders" element={<Orders />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="messages" element={<Messages />} />
        <Route path="merchant/auth" element={<MerchantAuth />} />
        <Route path="merchant/auctions" element={<MerchantAuctions />} />
        <Route path="merchant/auction/new" element={<MerchantAuctionForm />} />
        <Route path="merchant/auction/edit/:id" element={<MerchantAuctionForm />} />
        <Route path="merchant/orders" element={<MerchantOrders />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/merchants" element={<MerchantManagement />} />
        <Route path="admin/auctions" element={<AuctionManagement />} />
        <Route path="admin/orders" element={<OrderManagement />} />
        <Route path="admin/config" element={<SystemConfig />} />
        <Route path="operator" element={<OperatorDashboard />} />
        <Route path="operator/auctions" element={<OperatorAuctions />} />
        <Route path="operator/orders" element={<OperatorOrders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
