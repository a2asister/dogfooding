import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Badge, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  PlusCircleOutlined,
  WalletOutlined,
  BankOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  HistoryOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const notifications = storage.getNotifications().filter((n) => !n.isRead);
    setUnreadCount(notifications.length);
  }, []);

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/transactions',
      icon: <PlusCircleOutlined />,
      label: '记账管理',
    },
    {
      key: '/accounts',
      icon: <WalletOutlined />,
      label: '支付账户',
    },
    {
      key: '/assets',
      icon: <BankOutlined />,
      label: '资产负债',
    },
    {
      key: '/budgets',
      icon: <FileTextOutlined />,
      label: '预算管理',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '报表图表',
    },
    {
      key: '/categories',
      icon: <SettingOutlined />,
      label: '分类管理',
    },
    ...(isAdmin
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户管理',
          },
          {
            key: '/logs',
            icon: <HistoryOutlined />,
            label: '操作日志',
          },
        ]
      : []),
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setMobileMenuOpen(false);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        className={mobileMenuOpen ? 'mobile-menu-open' : ''}
      >
        <div className="sider-logo">
          <div className="logo-content">
            <DashboardOutlined className="logo-icon" />
            {!collapsed && <span className="logo-text">家庭财务管理</span>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => {
              if (window.innerWidth < 992) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={
                <Badge count={unreadCount} size="small">
                  <BellOutlined style={{ fontSize: 18 }} />
                </Badge>
              }
              onClick={() => navigate('/notifications')}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ display: 'inline', marginLeft: 8 }} className="user-name">
                  {currentUser?.name}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
