import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TrainScheduling from './pages/TrainScheduling';
import PassengerFlow from './pages/PassengerFlow';
import Ticketing from './pages/Ticketing';
import Security from './pages/Security';
import Equipment from './pages/Equipment';
import Personnel from './pages/Personnel';
import Emergency from './pages/Emergency';
import Statistics from './pages/Statistics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#3949ab',
      dark: '#0d1452',
    },
    secondary: {
      main: '#7b1fa2',
      light: '#9c27b0',
      dark: '#4a148c',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    info: {
      main: '#0288d1',
    },
    background: {
      default: '#f1f5f9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: 'none',
          borderRadius: 8,
        },
        outlined: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasPermission(requiredRoles as any)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = '火车站管理系统';
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/train-scheduling"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'dispatch_admin']}>
            <TrainScheduling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger-flow"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'dispatch_admin', 'regular_staff']}>
            <PassengerFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticketing"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'dispatch_admin', 'regular_staff']}>
            <Ticketing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'security_staff']}>
            <Security />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'maintenance_staff']}>
            <Equipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personnel"
        element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <Personnel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedRoute requiredRoles={['super_admin', 'dispatch_admin', 'security_staff']}>
            <Emergency />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
