import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import type { MenuProps } from 'antd';
import StudentManagement from '@/pages/admin/users/StudentManagement';
import TeacherManagement from '@/pages/admin/users/TeacherManagement';
import AdminManagement from '@/pages/admin/users/AdminManagement';
import CourseManagement from '@/pages/admin/courses/CourseManagement';
import CategoryManagement from '@/pages/admin/courses/CategoryManagement';
import BatchManagement from '@/pages/admin/batches/BatchManagement';
import StatisticsOverview from '@/pages/admin/statistics/StatisticsOverview';
import StatisticsHot from '@/pages/admin/statistics/StatisticsHot';
import GradeManagement from '@/pages/admin/grades/GradeManagement';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: '系统概览',
  },
  {
    key: '/admin/users',
    icon: <UserOutlined />,
    label: '用户管理',
    children: [
      { key: '/admin/users/students', label: '学生管理' },
      { key: '/admin/users/teachers', label: '教师管理' },
      { key: '/admin/users/admins', label: '管理员管理' },
    ],
  },
  {
    key: '/admin/grades',
    icon: <TeamOutlined />,
    label: '年级班级',
  },
  {
    key: '/admin/courses',
    icon: <BookOutlined />,
    label: '课程管理',
    children: [
      { key: '/admin/courses/list', label: '课程列表' },
      { key: '/admin/courses/categories', label: '课程分类' },
      { key: '/admin/courses/archives', label: '归档课程' },
    ],
  },
  {
    key: '/admin/batches',
    icon: <CalendarOutlined />,
    label: '选课批次',
  },
  {
    key: '/admin/statistics',
    icon: <BarChartOutlined />,
    label: '数据统计',
    children: [
      { key: '/admin/statistics/overview', label: '选课概况' },
      { key: '/admin/statistics/hot', label: '热门课程排行' },
      { key: '/admin/statistics/export', label: '数据导出' },
    ],
  },
  {
    key: '/admin/config',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken && !user) {
      dispatch(setCredentials({ token: storedToken, user: JSON.parse(storedUser) }));
    }
  }, [dispatch, user]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    dispatch(logout());
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const findSelectedKeys = (path: string): string[] => {
    if (menuItems.some(item => item.key === path)) {
      return [path];
    }
    for (const item of menuItems) {
      if ('children' in item && item.children) {
        if (item.children.some((child: { key: string; label: string }) => child.key === path)) {
          return [path];
        }
      }
    }
    return [];
  };

  const findOpenKeys = (path: string): string[] => {
    for (const item of menuItems) {
      if ('children' in item && item.children) {
        if (item.children.some((child: { key: string; label: string }) => child.key === path)) {
          return [item.key as string];
        }
      }
    }
    return [];
  };

  const selectedKeys = findSelectedKeys(location.pathname);
  const openKeys = findOpenKeys(location.pathname);

  return (
    <Layout className="layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="layout-sider"
        theme="dark"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
        }}>
          <AppstoreOutlined style={{ fontSize: 24, color: 'white' }} />
          {!collapsed && (
            <span style={{ color: 'white', marginLeft: 8, fontSize: 16, fontWeight: 600 }}>
              管理系统
            </span>
          )}
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
        <Header className="layout-header">
          <h2 className="layout-header-title">管理员端</h2>
          <div className="layout-header-user">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" style={{ color: 'white' }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ marginRight: 8, backgroundColor: '#1890ff' }}
                />
                <span>{user?.name || '管理员'}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className="layout-content">
          <Routes>
            <Route
              path="dashboard"
              element={
                <div className="content-card">
                  <h3 className="page-title">系统概览</h3>
                  <p style={{ color: '#666', marginTop: 16 }}>
                    欢迎使用大学选修课填报系统管理员端
                  </p>
                  <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <div className="stat-card">
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">学生总数</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">教师总数</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">课程总数</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value">0</div>
                      <div className="stat-card-label">选课记录</div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="users/students" element={<StudentManagement />} />
            <Route path="users/teachers" element={<TeacherManagement />} />
            <Route path="users/admins" element={<AdminManagement />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="courses/list" element={<CourseManagement />} />
            <Route path="courses/categories" element={<CategoryManagement />} />
            <Route path="courses/archives" element={<CourseManagement />} />
            <Route path="batches" element={<BatchManagement />} />
            <Route path="statistics/overview" element={<StatisticsOverview />} />
            <Route path="statistics/hot" element={<StatisticsHot />} />
            <Route
              path="*"
              element={
                <div className="content-card">
                  <div className="empty-state">
                    <h3>页面建设中</h3>
                    <p style={{ marginTop: 8 }}>该功能模块正在开发中</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
