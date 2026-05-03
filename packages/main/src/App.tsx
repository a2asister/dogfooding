import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Spin, message } from 'antd';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AppMarket from './pages/AppMarket';
import AppManage from './pages/AppManage';
import AppDetail from './pages/AppDetail';
import AppCreate from './pages/AppCreate';
import MicroAppWrapper from './components/MicroAppWrapper';
import './styles/global.css';

const { Content } = Layout;

message.config({
  top: 100,
  duration: 2,
  maxCount: 3,
  rtl: false,
});

const AppContent: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <MainLayout>
      <Content
        style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          minHeight: '280px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/app-market" element={<AppMarket />} />
          <Route path="/app-manage" element={<AppManage />} />
          <Route path="/app-manage/create" element={<AppCreate />} />
          <Route path="/app-manage/:appId" element={<AppDetail />} />
          <Route path="/app/:appName/*" element={<MicroAppWrapper />} />
        </Routes>
      </Content>
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
