import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { message } from 'antd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useAuthStore from './stores/authStore';
import useSiteStore from './stores/siteStore';
import { siteApi } from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import ContentModels from './pages/ContentModels';
import Contents from './pages/Contents';
import RoutesPage from './pages/Routes';
import Publish from './pages/Publish';
import CDNConfig from './pages/CDNConfig';
import MainLayout from './layouts/MainLayout';
import './index.css';

function App() {
  const { isAuthenticated, token } = useAuthStore();
  const { setSites, setCurrentSite, currentSite, sites } = useSiteStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      loadSites();
    }
  }, [isAuthenticated, token]);

  const loadSites = async () => {
    try {
      const response = await siteApi.getAll();
      if (response.success) {
        setSites(response.data);
        
        if (response.data.length > 0 && !currentSite) {
          setCurrentSite(response.data[0]);
        }
      }
    } catch (error) {
      message.error('加载站点列表失败');
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const SiteRequiredRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (!currentSite && sites.length === 0) {
      return <Navigate to="/sites" replace />;
    }
    return children;
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="dashboard" 
            element={
              <SiteRequiredRoute>
                <Dashboard />
              </SiteRequiredRoute>
            } 
          />
          
          <Route 
            path="sites" 
            element={<Sites />} 
          />
          
          <Route 
            path="models" 
            element={
              <SiteRequiredRoute>
                <ContentModels />
              </SiteRequiredRoute>
            } 
          />
          
          <Route 
            path="contents" 
            element={
              <SiteRequiredRoute>
                <Contents />
              </SiteRequiredRoute>
            } 
          />
          
          <Route 
            path="routes" 
            element={
              <SiteRequiredRoute>
                <RoutesPage />
              </SiteRequiredRoute>
            } 
          />
          
          <Route 
            path="publish" 
            element={
              <SiteRequiredRoute>
                <Publish />
              </SiteRequiredRoute>
            } 
          />
          
          <Route 
            path="cdn" 
            element={
              <SiteRequiredRoute>
                <CDNConfig />
              </SiteRequiredRoute>
            } 
          />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;
