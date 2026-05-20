import { Layout as AntLayout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  CodeOutlined,
  TrophyOutlined,
  FolderOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const studentMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/courses', icon: <BookOutlined />, label: '课程学习' },
  { key: '/homework', icon: <FolderOutlined />, label: '课后作业' },
  { key: '/challenges', icon: <TrophyOutlined />, label: '闯关练习' },
  { key: '/editor', icon: <CodeOutlined />, label: '编程创作' },
  { key: '/projects', icon: <FolderOutlined />, label: '我的作品' },
  { key: '/wrong-questions', icon: <BookOutlined />, label: '错题本' },
];

const teacherMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/classes', icon: <TeamOutlined />, label: '班级管理' },
  { key: '/courses', icon: <BookOutlined />, label: '课程管理' },
  { key: '/homework', icon: <FolderOutlined />, label: '作业管理' },
  { key: '/challenges', icon: <TrophyOutlined />, label: '闯关题库' },
  { key: '/stats', icon: <BarChartOutlined />, label: '学情统计' },
];

const parentMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/children', icon: <TeamOutlined />, label: '子女学习' },
  { key: '/reports', icon: <BarChartOutlined />, label: '学习报告' },
];

const adminMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/courses', icon: <BookOutlined />, label: '课程管理' },
  { key: '/challenges', icon: <TrophyOutlined />, label: '闯关管理' },
  { key: '/badges', icon: <TrophyOutlined />, label: '勋章管理' },
  { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const menuMap: Record<UserRole, typeof studentMenuItems> = {
  student: studentMenuItems,
  teacher: teacherMenuItems,
  parent: parentMenuItems,
  admin: adminMenuItems,
};

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = menuMap[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
    ],
  };

  return (
    <AntLayout className="min-h-screen">
      <Sider
        theme="light"
        width={220}
        className="shadow-lg"
      >
        <div className="h-16 flex items-center justify-center text-xl font-bold text-blue-600">
          🎮 少儿编程
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <AntLayout>
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm">
          <div className="text-lg font-medium text-gray-700">
            {menuItems.find((item) => item.key === location.pathname)?.label || '首页'}
          </div>
          <div className="flex items-center gap-4">
            <Badge count={3} size="small">
              <BellOutlined className="text-xl text-gray-600 cursor-pointer hover:text-blue-600" />
            </Badge>
            <Dropdown menu={userMenu}>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded">
                  <Avatar size="small" icon={<UserOutlined />}
                  <span className="text-gray-700">{user.nickname}</span>
                </div>
              </Dropdown>
        </Header>
        <Content className="m-6 bg-white rounded-lg shadow-sm p-6">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
