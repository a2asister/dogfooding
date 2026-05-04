import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  StockOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  ReconciliationOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import HR from './pages/HR';
import Finance from './pages/Finance';
import Admin from './pages/Admin';
import Asset from './pages/Asset';
import Project from './pages/Project';
import Contract from './pages/Contract';
import Vehicle from './pages/Vehicle';
import Meeting from './pages/Meeting';
import Purchase from './pages/Purchase';
import Reimbursement from './pages/Reimbursement';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/hr', icon: <TeamOutlined />, label: '人事管理' },
  { key: '/finance', icon: <MoneyCollectOutlined />, label: '财务管理' },
  { key: '/admin', icon: <FileTextOutlined />, label: '行政管理' },
  { key: '/asset', icon: <StockOutlined />, label: '资产管理' },
  { key: '/project', icon: <ProjectOutlined />, label: '项目管理' },
  { key: '/contract', icon: <SafetyCertificateOutlined />, label: '合同管理' },
  { key: '/vehicle', icon: <CarOutlined />, label: '用车管理' },
  { key: '/meeting', icon: <CalendarOutlined />, label: '会议室管理' },
  { key: '/purchase', icon: <ShoppingCartOutlined />, label: '采购管理' },
  { key: '/reimbursement', icon: <ReconciliationOutlined />, label: '报销管理' },
];

const userMenu = [
  { key: '1', icon: <UserOutlined />, label: '个人信息' },
  { key: '2', icon: <SettingOutlined />, label: '设置' },
  { type: 'divider' },
  { key: '3', icon: <LogoutOutlined />, label: '退出登录' },
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          margin: 16,
          borderRadius: 8,
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: collapsed ? 14 : 18 }}>
            {collapsed ? 'OA' : '集团OA系统'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <DashboardOutlined /> : <DashboardOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#666' }}>今天是 {new Date().toLocaleDateString('zh-CN')}</span>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span style={{ color: '#333' }}>管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{
          margin: 24,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hr" element={<HR />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/asset" element={<Asset />} />
            <Route path="/project" element={<Project />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/vehicle" element={<Vehicle />} />
            <Route path="/meeting" element={<Meeting />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/reimbursement" element={<Reimbursement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
