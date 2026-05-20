import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BellOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import request from '../utils/request';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/users', icon: <UserOutlined />, label: '用户管理' },
      { key: '/system/roles', icon: <TeamOutlined />, label: '角色管理' },
      { key: '/system/logs', icon: <FileTextOutlined />, label: '操作日志' },
      { key: '/system/configs', icon: <AppstoreOutlined />, label: '系统配置' },
    ],
  },
  {
    key: '/org',
    icon: <TeamOutlined />,
    label: '组织架构',
    children: [
      { key: '/org/departments', icon: <TeamOutlined />, label: '部门管理' },
      { key: '/org/employees', icon: <UserOutlined />, label: '员工管理' },
    ],
  },
  {
    key: '/kpi',
    icon: <TrophyOutlined />,
    label: 'KPI管理',
    children: [
      { key: '/kpi/indicators', icon: <FileTextOutlined />, label: '指标库' },
      { key: '/kpi/schemes', icon: <FileTextOutlined />, label: '考核方案' },
      { key: '/kpi/plans', icon: <CalendarOutlined />, label: '考核计划' },
      { key: '/kpi/personal', icon: <UserOutlined />, label: '个人KPI' },
      { key: '/kpi/results', icon: <TrophyOutlined />, label: '绩效结果' },
    ],
  },
  { key: '/statistics', icon: <BarChartOutlined />, label: '数据统计' },
];

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();

  useEffect(() => {
    request.get('/notifications/unread-count').then((res: any) => {
      if (res.code === 0) {
        setUnreadCount(res.data.count);
      }
    });
  }, []);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await request.post('/auth/logout');
        logout();
        navigate('/login');
      },
    },
  ];

  const findSelectedKeys = (items: MenuItem[], path: string): string[] => {
    for (const item of items) {
      if (item.key === path) return [item.key];
      if (item.children) {
        const found = findSelectedKeys(item.children, path);
        if (found.length > 0) return [item.key, ...found];
      }
    }
    return [];
  };

  const selectedKeys = findSelectedKeys(menuItems, location.pathname);
  const openKeys = selectedKeys.slice(0, -1);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 14 : 18, fontWeight: 'bold' }}>
          {collapsed ? 'KPI' : 'KPI绩效管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>KPI绩效管理平台</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={unreadCount}>
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.realName || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
