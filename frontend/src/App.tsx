import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClipboardProvider } from './contexts/ClipboardContext';
import AuthPage from './components/AuthPage';
import Desktop from './components/Desktop';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>加载中...</div>;
  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/desktop" /> : <AuthPage />} />
      <Route
        path="/desktop"
        element={
          <ProtectedRoute>
            <ClipboardProvider>
              <Desktop />
            </ClipboardProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;