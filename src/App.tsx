import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';

// 前台页面
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioDetailPage from './pages/PortfolioDetailPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ServicesPage from './pages/ServicesPage';
import MaterialsPage from './pages/MaterialsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 后台页面
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPortfolios from './pages/admin/AdminPortfolios';
import AdminCases from './pages/admin/AdminCases';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPackages from './pages/admin/AdminPackages';
import AdminMaterials from './pages/admin/AdminMaterials';
import AdminMessages from './pages/admin/AdminMessages';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// 加载组件
import { Loader2 } from 'lucide-react';
import { useAppStore } from './store';

function App() {
  const isDataInitialized = useAppStore(state => state.isDataInitialized);
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  // 加载状态
  if (!isDataInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载应用...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 前台路由 */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 后台路由 */}
      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="portfolios" element={<AdminPortfolios />} />
        <Route path="cases" element={<AdminCases />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 路由 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
