import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  StarOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { authApi } from '../api';

const { Header, Sider, Content } = Layout;

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { key: '/student/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/student/schedule', icon: <CalendarOutlined />, label: '课表查询' },
    { key: '/student/grades', icon: <TrophyOutlined />, label: '成绩查询' },
    { key: '/student/courses', icon: <BookOutlined />, label: '课程选择' },
    { key: '/student/evaluations', icon: <StarOutlined />, label: '期末评教' },
    { key: '/student/messages', icon: <MessageOutlined />, label: '消息中心' },
    { key: '/student/profile', icon: <UserOutlined />, label: '学籍信息' },
    { key: '/student/settings', icon: <SettingOutlined />, label: '账号安全' },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
        onClick: () => navigate('/student/profile'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账号设置',
        onClick: () => navigate('/student/settings'),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          🎓 学生管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '500' }}>欢迎回来，{user?.name} 同学</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => navigate('/student/messages')}
            />
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout;
