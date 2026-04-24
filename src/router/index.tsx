import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Rooms from '@/pages/Rooms';

const Orders = lazy(() => import('@/pages/Orders'));
const Customers = lazy(() => import('@/pages/Customers'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const WorkOrders = lazy(() => import('@/pages/WorkOrders'));
const Exceptions = lazy(() => import('@/pages/Exceptions'));
const Settings = lazy(() => import('@/pages/Settings'));

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/rooms" element={
          <Layout>
            <Rooms />
          </Layout>
        } />
        
        <Route path="/orders" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Orders />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/orders/:id" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Orders />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/customers" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Customers />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/pricing" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Pricing />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/analytics" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Analytics />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/work-orders" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <WorkOrders />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/exceptions" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Exceptions />
            </Suspense>
          </Layout>
        } />
        
        <Route path="/settings" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Settings />
            </Suspense>
          </Layout>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
