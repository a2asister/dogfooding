import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  GithubOutlined,
  BranchesOutlined,
  PullRequestOutlined,
  RocketOutlined,
  DeploymentUnitOutlined,
  HistoryOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useState, useEffect } from 'react';
import { alertApi } from '@/api';
import type { ReactNode } from 'react';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async (): Promise<void> => {
      try {
        const result = await alertApi.list({ page: 1, pageSize: 1, read: false });
        setUnreadCount(result.unreadCount);
      } catch {
        // ignore
      }
    };
    fetchAlerts();
  }, []);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '首页看板',
    },
    {
      key: '/repositories',
      icon: <GithubOutlined />,
      label: '仓库管理',
    },
    {
      key: '/branch-rules',
      icon: <BranchesOutlined />,
      label: '分支规范',
    },
    {
      key: '/pull-requests',
      icon: <PullRequestOutlined />,
      label: 'PR审核',
    },
    {
      key: '/pipelines',
      icon: <CodeOutlined />,
      label: 'CI流水线',
    },
    {
      key: '/pipeline-runs',
      icon: <RocketOutlined />,
      label: '运行记录',
    },
    {
      key: '/environments',
      icon: <DeploymentUnitOutlined />,
      label: '环境部署',
    },
    {
      key: '/deployments',
      icon: <RocketOutlined />,
      label: '部署历史',
    },
    {
      key: '/snapshots',
      icon: <HistoryOutlined />,
      label: '版本快照',
    },
    {
      key: '/alerts',
      icon: <Badge count={unreadCount} size="small"><BellOutlined /></Badge>,
      label: '告警中心',
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户管理',
          },
          {
            key: '/audit-logs',
            icon: <FileTextOutlined />,
            label: '审计日志',
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.username,
      disabled: true,
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 16 : 20, fontWeight: 'bold', background: '#002140' }}>
          {collapsed ? 'CICD' : 'CICD 自动化平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            {menuItems.find((m) => m.key === location.pathname)?.label as string || 'CICD 自动化平台'}
          </h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" src={user?.avatarUrl} icon={<UserOutlined />} />
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', background: '#fff', padding: 24, borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
