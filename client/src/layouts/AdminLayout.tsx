import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  BarChartOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/admin/Dashboard';
import Accounts from '@/pages/admin/Accounts';
import Departments from '@/pages/admin/Departments';
import Staff from '@/pages/admin/Staff';
import ScheduleConfig from '@/pages/admin/ScheduleConfig';
import Statistics from '@/pages/admin/Statistics';
import Dictionary from '@/pages/admin/Dictionary';
import SystemConfig from '@/pages/admin/SystemConfig';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'super_admin';

  const menuItems = [
    { key: '/admin', icon: <BarChartOutlined />, label: <Link to="/admin">数据概览</Link> },
    { key: '/admin/accounts', icon: <UserOutlined />, label: <Link to="/admin/accounts">账号管理</Link> },
    { key: '/admin/departments', icon: <AppstoreOutlined />, label: <Link to="/admin/departments">科室管理</Link> },
    { key: '/admin/staff', icon: <TeamOutlined />, label: <Link to="/admin/staff">医护档案</Link> },
    { key: '/admin/schedule', icon: <CalendarOutlined />, label: <Link to="/admin/schedule">号源配置</Link> },
    { key: '/admin/statistics', icon: <BarChartOutlined />, label: <Link to="/admin/statistics">统计报表</Link> },
    ...(isSuperAdmin
      ? [
          { key: '/admin/dictionary', icon: <BookOutlined />, label: <Link to="/admin/dictionary">数据字典</Link> },
          { key: '/admin/config', icon: <SettingOutlined />, label: <Link to="/admin/config">系统配置</Link> },
        ]
      : []),
  ];

  const userMenu = {
    items: [
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  return (
    <Layout className="min-h-h">
      <Header className="bg-white flex items-center justify-between px-6 shadow-sm">
        <h1 className="text-xl font-bold text-primary m-0">🏥 医院管理后台</h1>
        <Dropdown menu={userMenu} placement="bottomRight">
          <Button type="text" className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.real_name}</span>
          </Button>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={220} className="bg-white">
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} className="h-full border-none" />
        </Sider>
        <Content className="page-container bg-gray-50">
          <Routes>
            <Route
              index
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin', 'finance', 'pharmacist', 'technician']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="accounts"
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin']}>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin']}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="schedule"
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin']}>
                  <ScheduleConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="statistics"
              element={
                <ProtectedRoute roles={['super_admin', 'hospital_admin']}>
                  <Statistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="dictionary"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <Dictionary />
                </ProtectedRoute>
              }
            />
            <Route
              path="config"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <SystemConfig />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
