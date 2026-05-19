import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import PortalLayout from '../layouts/PortalLayout';
import StudentLayout from '../layouts/StudentLayout';
import Login from '../pages/Login';
import Home from '../pages/portal/Home';
import About from '../pages/portal/About';
import News from '../pages/portal/News';
import NewsDetail from '../pages/portal/NewsDetail';
import Admission from '../pages/portal/Admission';
import Research from '../pages/portal/Research';
import Services from '../pages/portal/Services';
import Dashboard from '../pages/student/Dashboard';
import Schedule from '../pages/student/Schedule';
import Grades from '../pages/student/Grades';
import Courses from '../pages/student/Courses';
import Evaluations from '../pages/student/Evaluations';
import Messages from '../pages/student/Messages';
import Profile from '../pages/student/Profile';
import Settings from '../pages/student/Settings';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const isAuth = isAuthenticated && checkAuth();
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PortalLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="admission" element={<Admission />} />
          <Route path="research" element={<Research />} />
          <Route path="services" element={<Services />} />
        </Route>
        <Route
          path="/student"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="grades" element={<Grades />} />
          <Route path="courses" element={<Courses />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
