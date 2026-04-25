import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Avatar, Button, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  FileTextOutlined,
  ToolOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useAuthStore, roleDescriptions } from '../stores/authStore';
import { useHospitalStore } from '../stores/hospitalStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: '首页概览',
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: '用户管理',
  },
  {
    key: '/admin/departments',
    icon: <ApartmentOutlined />,
    label: '科室管理',
  },
  {
    key: '/admin/doctors',
    icon: <UserOutlined />,
    label: '医生管理',
  },
  {
    key: '/admin/medications',
    icon: <MedicineBoxOutlined />,
    label: '药品管理',
  },
  {
    key: '/admin/equipment',
    icon: <ToolOutlined />,
    label: '设备管理',
  },
  {
    key: '/admin/logs',
    icon: <FileTextOutlined />,
    label: '操作日志',
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { loadAll } = useHospitalStore();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'info',
      icon: <UserOutlined />,
      label: (
        <div>
          <div>{currentUser?.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {currentUser?.role ? roleDescriptions[currentUser.role] : ''}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      <Sider
        width={240}
        style={{
          background: '#001529',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <MedicineBoxOutlined style={{ fontSize: 28, color: '#1890ff', marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            医院管理系统
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          flex: 1,
        }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            height: 64,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
              管理员控制台
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
              />
            </Badge>

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'background 0.3s',
                  whiteSpace: 'nowrap',
                  maxWidth: '250px',
                }}
              >
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', flexShrink: 0 }} />
                <div style={{ marginLeft: 8, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1.4, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
                  <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.role ? roleDescriptions[currentUser.role] : ''}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            background: '#f0f2f5',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 24,
              background: colorBgContainer,
              minHeight: '100%',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
