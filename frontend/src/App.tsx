import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import StudentHomePage from './pages/student/HomePage';
import CoursesPage from './pages/student/CoursesPage';
import HomeworkPage from './pages/student/HomeworkPage';
import ChallengesPage from './pages/student/ChallengesPage';
import EditorPage from './pages/student/EditorPage';
import ProjectsPage from './pages/student/ProjectsPage';
import WrongQuestionsPage from './pages/student/WrongQuestionsPage';
import TeacherHomePage from './pages/teacher/TeacherHomePage';
import ClassesPage from './pages/teacher/ClassesPage';
import TeacherHomeworkPage from './pages/teacher/TeacherHomeworkPage';
import ParentHomePage from './pages/parent/ParentHomePage';
import AdminHomePage from './pages/admin/AdminHomePage';
import UsersPage from './pages/admin/UsersPage';
import { useAuthStore } from './store/useAuthStore';
import { UserRole } from './types';

const roleHomeRoutes: Record<UserRole, string> = {
  student: '/',
  teacher: '/',
  parent: '/',
  admin: '/',
};

function AppRoutes() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const StudentRoutes = () => (
    <Routes>
      <Route path="/" element={<Layout><StudentHomePage /></Layout>} />
      <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
      <Route path="/homework" element={<Layout><HomeworkPage /></Layout>} />
      <Route path="/challenges" element={<Layout><ChallengesPage /></Layout>} />
      <Route path="/editor" element={<Layout><EditorPage /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
      <Route path="/wrong-questions" element={<Layout><WrongQuestionsPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const TeacherRoutes = () => (
    <Routes>
      <Route path="/" element={<Layout><TeacherHomePage /></Layout>} />
      <Route path="/classes" element={<Layout><ClassesPage /></Layout>} />
      <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
      <Route path="/homework" element={<Layout><TeacherHomeworkPage /></Layout>} />
      <Route path="/challenges" element={<Layout><ChallengesPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const ParentRoutes = () => (
    <Routes>
      <Route path="/" element={<Layout><ParentHomePage /></Layout>} />
      <Route path="/children" element={<Layout><ParentHomePage /></Layout>} />
      <Route path="/reports" element={<Layout><ParentHomePage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const AdminRoutes = () => (
    <Routes>
      <Route path="/" element={<Layout><AdminHomePage /></Layout>} />
      <Route path="/users" element={<Layout><UsersPage /></Layout>} />
      <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
      <Route path="/challenges" element={<Layout><ChallengesPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const RoleBasedRoutes = () => {
    switch (user.role) {
      case 'student':
        return <StudentRoutes />;
      case 'teacher':
        return <TeacherRoutes />;
      case 'parent':
        return <ParentRoutes />;
      case 'admin':
        return <AdminRoutes />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return <RoleBasedRoutes />;
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        },
        components: {
          Button: {
            controlHeight: 36,
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
