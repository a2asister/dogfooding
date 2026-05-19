import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Reception from '@/pages/medical/Reception';
import MedicalRecord from '@/pages/medical/MedicalRecord';

const { Header, Content } = Layout;

export default function MedicalLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/medical', icon: <DashboardOutlined />, label: <Link to="/medical">接诊看板</Link> },
  ];

  const userMenu = {
    items: [
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
    ],
  };

  return (
    <Layout className="min-h-h">
      <Header className="bg-white flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-primary m-0">🏥 医护工作站</h1>
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
              <ProtectedRoute roles={['doctor', 'nurse']}>
                <Reception />
              </ProtectedRoute>
            }
          />
          <Route
            path="reception"
            element={
              <ProtectedRoute roles={['doctor', 'nurse']}>
                <Reception />
              </ProtectedRoute>
            }
          />
          <Route
            path="medical-record/:visitId"
            element={
              <ProtectedRoute roles={['doctor']}>
                <MedicalRecord />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}
