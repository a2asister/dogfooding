import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/layout'
import AuthGuard from '@/components/AuthGuard'

const LoginPage = lazy(() => import('@/pages/Login'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ProjectsPage = lazy(() => import('@/pages/Projects'))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetail'))
const IssueDetailPage = lazy(() => import('@/pages/IssueDetail'))
const BacklogPage = lazy(() => import('@/pages/Backlog'))
const SprintsPage = lazy(() => import('@/pages/Sprints'))
const VersionsPage = lazy(() => import('@/pages/Versions'))
const ReportsPage = lazy(() => import('@/pages/Reports'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const GanttPage = lazy(() => import('@/pages/Gantt'))
const CalendarPage = lazy(() => import('@/pages/Calendar'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailPage />,
        children: [
          {
            index: true,
            element: <Navigate to="board" replace />,
          },
          {
            path: 'board',
            element: <BacklogPage />,
          },
          {
            path: 'list',
            element: <BacklogPage />,
          },
          {
            path: 'backlog',
            element: <BacklogPage />,
          },
          {
            path: 'sprints',
            element: <SprintsPage />,
          },
          {
            path: 'versions',
            element: <VersionsPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'gantt',
            element: <GanttPage />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: 'issues/:issueId',
        element: <IssueDetailPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default router
