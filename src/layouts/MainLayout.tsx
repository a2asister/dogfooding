import { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Button, Space, Switch, Typography } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  FileTextOutlined,
  CarFilled,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setAutoRefresh, setRefreshInterval } from '@/store/slices/systemSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const [collapsed, setCollapsed] = useState(false);
  const { isAutoRefresh, refreshInterval, currentUser } = useAppSelector((state) => state.system);
  const { unreadCount } = useAppSelector((state) => state.alerts);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '调度总览',
    },
    {
      key: '/vehicles',
      icon: <CarOutlined />,
      label: '车辆管理',
    },
    {
      key: '/drivers',
      icon: <UserOutlined />,
      label: '司机管理',
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单调度',
    },
    {
      key: '/trips',
      icon: <CarFilled />,
      label: '行程监控',
    },
    {
      key: '/config',
      icon: <SettingOutlined />,
      label: '调度配置',
    },
    {
      key: '/passengers',
      icon: <TeamOutlined />,
      label: '乘客订单',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '运营报表',
    },
    {
      key: '/alerts',
      icon: (
        <Badge 
          count={unreadCount} 
          showZero 
          offset={[10, -5]}
          size="small"
        >
          <BellOutlined />
        </Badge>
      ),
      label: '消息告警',
    },
    {
      key: '/permissions',
      icon: <SafetyCertificateOutlined />,
      label: '系统权限',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleRefreshToggle = (checked: boolean) => {
    dispatch(setAutoRefresh(checked));
  };

  const handleManualRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(() => {
        dispatch({ type: 'system/setLastUpdate', payload: new Date().toISOString() });
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval, dispatch]);

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={220}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)' }}>
          <CarFilled style={{ fontSize: 24, color: '#fff', marginRight: 8 }} />
          {!collapsed && (
            <Typography.Title level={5} style={{ color: '#fff', margin: 0 }}>
              智能调度系统
            </Typography.Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {menuItems.find((item) => item.key === location.pathname)?.label || '调度总览'}
            </Typography.Title>
          </div>
          <Space size="middle">
            <Space size="small">
              <Text type="secondary">自动刷新</Text>
              <Switch
                checked={isAutoRefresh}
                onChange={handleRefreshToggle}
                size="small"
              />
              {isAutoRefresh && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {refreshInterval / 1000}s
                </Text>
              )}
            </Space>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleManualRefresh}
              title="手动刷新"
            />
            <Badge count={unreadCount} showZero>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => navigate('/alerts')}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text>{currentUser?.name || '用户'}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
