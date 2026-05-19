import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import PatientHome from '@/pages/patient/Home';
import Departments from '@/pages/patient/Departments';
import Doctors from '@/pages/patient/Doctors';
import Appointment from '@/pages/patient/Appointment';
import MyAppointments from '@/pages/patient/MyAppointments';
import Profile from '@/pages/patient/Profile';

const { Header, Content } = Layout;

export default function PatientLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/patient', icon: <HomeOutlined />, label: <Link to="/patient">首页</Link> },
    { key: '/patient/departments', icon: <AppstoreOutlined />, label: <Link to="/patient/departments">科室</Link> },
    { key: '/patient/my-appointments', icon: <CalendarOutlined />, label: <Link to="/patient/my-appointments">我的预约</Link> },
    { key: '/patient/profile', icon: <UserOutlined />, label: <Link to="/patient/profile">个人中心</Link> },
  ];

  const userMenu = {
    items: [
      { key: 'profile', label: <Link to="/patient/profile">个人中心</Link> },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-primary m-0">🏥 智慧医院</h1>
          <Menu mode="horizontal" selectedKeys={[location.pathname]} items={menuItems} className="flex-1 border-none" />
        </div>
        <Dropdown menu={userMenu} placement="bottomRight">
          <Button type="text" className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.real_name}</span>
          </Button>
        </Dropdown>
      </Header>
      <Content className="page-container bg-gray-50">
        <Routes>
          <Route
            index
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments"
            element={
              <ProtectedRoute roles={['patient']}>
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="doctors/:deptId"
            element={
              <ProtectedRoute roles={['patient']}>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="appointment/:doctorId"
            element={
              <ProtectedRoute roles={['patient']}>
                <Appointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-appointments"
            element={
              <ProtectedRoute roles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute roles={['patient']}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}
