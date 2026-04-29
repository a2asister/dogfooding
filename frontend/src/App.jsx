import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button, message, Space, theme } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  FileTextOutlined,
  FolderOutlined,
  ScheduleOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  SettingOutlined,
  BugOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import TestCases from './pages/TestCases';
import TestCaseEditor from './pages/TestCaseEditor';
import TestSuites from './pages/TestSuites';
import Tasks from './pages/Tasks';
import TestRuns from './pages/TestRuns';
import TestRunReport from './pages/TestRunReport';
import Environments from './pages/Environments';
import Parameters from './pages/Parameters';
import Defects from './pages/Defects';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: '/test-cases', icon: <FileTextOutlined />, label: '测试用例' },
  { key: '/test-suites', icon: <FolderOutlined />, label: '测试套件' },
  { key: '/tasks', icon: <ScheduleOutlined />, label: '任务调度' },
  { key: '/test-runs', icon: <PlayCircleOutlined />, label: '测试运行' },
  { key: '/environments', icon: <GlobalOutlined />, label: '测试环境' },
  { key: '/parameters', icon: <SettingOutlined />, label: '参数管理' },
  { key: '/defects', icon: <BugOutlined />, label: '缺陷管理' }
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({ username: 'admin', role: 'admin' });
  const location = useLocation();

  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        message.info('已退出登录');
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#002140'
        }}>
          <div style={{
            color: '#fff',
            fontSize: collapsed ? 16 : 18,
            fontWeight: 'bold'
          }}>
            {collapsed ? 'AT' : '自动化测试平台'}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            window.location.href = key;
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user.username}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/test-cases/:id" element={<TestCaseEditor />} />
            <Route path="/test-suites" element={<TestSuites />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/test-runs" element={<TestRuns />} />
            <Route path="/test-runs/:id" element={<TestRunReport />} />
            <Route path="/environments" element={<Environments />} />
            <Route path="/parameters" element={<Parameters />} />
            <Route path="/defects" element={<Defects />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
