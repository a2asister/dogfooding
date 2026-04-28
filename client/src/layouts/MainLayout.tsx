import React from 'react';
import { Layout, Menu, theme, Dropdown, Avatar, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TruckOutlined,
  ShopOutlined,
  CarOutlined,
  UserOutlined,
  WarningOutlined,
  RollbackOutlined,
  MessageOutlined,
  InboxOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore, useAppStore } from '../store';
import { UserRole } from '../types';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles?: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '数据概览',
    path: '/dashboard'
  },
  {
    key: 'orders',
    icon: <FileTextOutlined />,
    label: '订单管理',
    path: '/orders'
  },
  {
    key: 'waybills',
    icon: <TruckOutlined />,
    label: '运单管理',
    path: '/waybills'
  },
  {
    key: 'branches',
    icon: <ShopOutlined />,
    label: '网点管理',
    path: '/branches',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  },
  {
    key: 'vehicles',
    icon: <CarOutlined />,
    label: '车辆管理',
    path: '/vehicles',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: '人员管理',
    path: '/users',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  },
  {
    key: 'exceptions',
    icon: <WarningOutlined />,
    label: '异常件管理',
    path: '/exceptions'
  },
  {
    key: 'returns',
    icon: <RollbackOutlined />,
    label: '退换货管理',
    path: '/returns'
  },
  {
    key: 'feedbacks',
    icon: <MessageOutlined />,
    label: '客户反馈',
    path: '/feedbacks'
  },
  {
    key: 'inventory',
    icon: <InboxOutlined />,
    label: '仓储物料',
    path: '/inventory'
  },
  {
    key: 'reports',
    icon: <BarChartOutlined />,
    label: '运营报表',
    path: '/reports',
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  }
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();
  const { user, clearAuth } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed, setCurrentRoute } = useAppStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    const matchedItem = menuItems.find((item) => path.startsWith(item.path));
    return matchedItem?.key || 'dashboard';
  };

  const handleMenuClick = (item: { key: string }) => {
    const menuItem = menuItems.find((m) => m.key === item.key);
    if (menuItem) {
      navigate(menuItem.path);
      setCurrentRoute(menuItem.path);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={sidebarCollapsed} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#002140' }}>
          {sidebarCollapsed ? (
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>快</span>
          ) : (
            <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>快递物流管理系统</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={filteredMenuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span>{user?.name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 16, background: colorBgContainer, minHeight: 280, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
