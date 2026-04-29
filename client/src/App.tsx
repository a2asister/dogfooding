import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin/*"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminLayout />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <PrivateRoute requiredRole="teacher">
                  <TeacherLayout />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <PrivateRoute requiredRole="student">
                  <StudentLayout />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  );
};

export default App;
