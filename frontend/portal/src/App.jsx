import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { initQiankun, updateGlobalState } from './micro';
import Login from './pages/Login';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  const location = useLocation();
  
  const isAuthenticated = useMemo(() => {
    return !!token && !!user;
  }, [token, user]);

  useEffect(() => {
    if (isAuthenticated) {
      updateGlobalState({ token, user });
    }
  }, [token, user, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const { token, user } = useAuthStore();
  
  const isAuthenticated = useMemo(() => {
    return !!token && !!user;
  }, [token, user]);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        initQiankun();
      }, 100);
    }
  }, [isAuthenticated, token, user]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
