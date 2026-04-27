import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { useAuthStore } from '@/store';

const SplashPage = lazy(() => import('@/pages/SplashPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const JobsPage = lazy(() => import('@/pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('@/pages/jobs/JobDetailPage'));
const MessagesPage = lazy(() => import('@/pages/messages/MessagesPage'));
const ChatPage = lazy(() => import('@/pages/messages/ChatPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const ResumePage = lazy(() => import('@/pages/resume/ResumePage'));
const CompanyPage = lazy(() => import('@/pages/company/CompanyPage'));
const ApplicationsPage = lazy(() => import('@/pages/applications/ApplicationsPage'));
const InterviewsPage = lazy(() => import('@/pages/interviews/InterviewsPage'));
const FavoritesPage = lazy(() => import('@/pages/favorites/FavoritesPage'));
const HistoryPage = lazy(() => import('@/pages/history/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">加载中...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuthStore.getState();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuthStore.getState();
  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <SplashPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'home',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'jobs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JobsPage />
          </Suspense>
        ),
      },
      {
        path: 'jobs/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <JobDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'messages',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MessagesPage />
          </Suspense>
        ),
      },
      {
        path: 'messages/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'resume',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResumePage />
          </Suspense>
        ),
      },
      {
        path: 'company/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompanyPage />
          </Suspense>
        ),
      },
      {
        path: 'applications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ApplicationsPage />
          </Suspense>
        ),
      },
      {
        path: 'interviews',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <InterviewsPage />
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FavoritesPage />
          </Suspense>
        ),
      },
      {
        path: 'history',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HistoryPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
]);
