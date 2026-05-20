import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, ProjectOutlined, TeamOutlined, AppstoreOutlined, LogoutOutlined } from '@ant-design/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import UserManagement from './pages/UserManagement';
import Organization from './pages/Organization';

const { Header, Content } = Layout;

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="app-container">
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="app-logo" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          项目管理系统
        </div>
        {isAuthenticated && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[]}
            style={{ background: 'transparent', minWidth: 400 }}
          >
            <Menu.Item key="projects" icon={<ProjectOutlined />}>
              <Link to="/">项目列表</Link>
            </Menu.Item>
            <Menu.Item key="users" icon={<UserOutlined />}>
              <Link to="/users">用户管理</Link>
            </Menu.Item>
            <Menu.Item key="organization" icon={<TeamOutlined />}>
              <Link to="/organization">组织架构</Link>
            </Menu.Item>
          </Menu>
        )}
      </div>
      {isAuthenticated && user && (
        <Dropdown overlay={userMenu}>
          <Space style={{ cursor: 'pointer', color: 'white' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user.realName}</span>
          </Space>
        </Dropdown>
      )}
    </Header>
    <Content className="app-content" style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/organization" element={
          <ProtectedRoute>
            <Organization />
          </ProtectedRoute>
        } />
      </Routes>
    </Content>
  </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
