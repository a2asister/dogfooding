import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  StarOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, setCredentials } from '@/store/slices/authSlice';
import type { MenuProps } from 'antd';
import CourseHall from '@/pages/student/CourseHall';
import MyCourses from '@/pages/student/MyCourses';
import MySchedule from '@/pages/student/MySchedule';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/student/courses',
    icon: <BookOutlined />,
    label: '选课大厅',
  },
  {
    key: '/student/my-courses',
    icon: <CalendarOutlined />,
    label: '我的选课',
  },
  {
    key: '/student/favorites',
    icon: <StarOutlined />,
    label: '我的收藏',
  },
  {
    key: '/student/schedule',
    icon: <ScheduleOutlined />,
    label: '我的课表',
  },
  {
    key: '/student/statistics',
    icon: <BarChartOutlined />,
    label: '选课统计',
  },
];

const StudentLayout: React.FC = () => {
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
      onClick: () => navigate('/student/profile'),
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
          <ScheduleOutlined style={{ fontSize: 24, color: 'white' }} />
          {!collapsed && (
            <span style={{ color: 'white', marginLeft: 8, fontSize: 16, fontWeight: 600 }}>
              学生端
            </span>
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
        <Header className="layout-header">
          <h2 className="layout-header-title">学生端</h2>
          <div className="layout-header-user">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" style={{ color: 'white' }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ marginRight: 8, backgroundColor: '#1890ff' }}
                />
                <span>{user?.name || '学生'}</span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className="layout-content">
          <Routes>
            <Route path="courses" element={<CourseHall />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="schedule" element={<MySchedule />} />
            <Route
              path="favorites"
              element={
                <div className="content-card">
                  <h3 className="page-title">我的收藏</h3>
                  <div className="empty-state">
                    <p style={{ color: '#666' }}>暂无收藏课程</p>
                  </div>
                </div>
              }
            />
            <Route
              path="statistics"
              element={
                <div className="content-card">
                  <h3 className="page-title">选课统计</h3>
                  <div className="empty-state">
                    <p style={{ color: '#666' }}>暂无统计数据</p>
                  </div>
                </div>
              }
            />
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

export default StudentLayout;
