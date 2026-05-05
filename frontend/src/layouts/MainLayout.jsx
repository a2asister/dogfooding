import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Select, Button } from 'antd';
import {
  DashboardOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LinkOutlined,
  RocketOutlined,
  CloudOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import useAuthStore from '../stores/authStore';
import useSiteStore from '../stores/siteStore';
import { siteApi } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { currentSite, sites, setCurrentSite, addSite, setSites } = useSiteStore();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('sites')) return 'sites';
    if (path.includes('models')) return 'models';
    if (path.includes('contents')) return 'contents';
    if (path.includes('routes')) return 'routes';
    if (path.includes('publish')) return 'publish';
    if (path.includes('cdn')) return 'cdn';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'sites',
      icon: <GlobalOutlined />,
      label: '站点管理',
      onClick: () => navigate('/sites')
    },
    {
      key: 'models',
      icon: <DatabaseOutlined />,
      label: '内容模型',
      onClick: () => navigate('/models')
    },
    {
      key: 'contents',
      icon: <FileTextOutlined />,
      label: '内容管理',
      onClick: () => navigate('/contents')
    },
    {
      key: 'routes',
      icon: <LinkOutlined />,
      label: '路由规则',
      onClick: () => navigate('/routes')
    },
    {
      key: 'publish',
      icon: <RocketOutlined />,
      label: '发布管理',
      onClick: () => navigate('/publish')
    },
    {
      key: 'cdn',
      icon: <CloudOutlined />,
      label: 'CDN 配置',
      onClick: () => navigate('/cdn')
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const handleSiteChange = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setCurrentSite(site);
    }
  };

  const handleCreateSite = () => {
    navigate('/sites');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="site-layout-sider"
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 16
        }}>
          <span style={{
            color: 'white',
            fontSize: collapsed ? 12 : 18,
            fontWeight: 'bold'
          }}>
            {collapsed ? 'CMS' : '动态 CMS'}
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="site-layout-header">
          <div className="header-title">
            <GlobalOutlined style={{ fontSize: 20, color: '#667eea' }} />
            <span>动态 CMS 管理系统</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {currentSite && sites.length > 0 && (
              <Select
                value={currentSite.id}
                onChange={handleSiteChange}
                style={{ width: 200 }}
                placeholder="选择站点"
                size="large"
              >
                {sites.map(site => (
                  <Option key={site.id} value={site.id}>
                    {site.name}
                  </Option>
                ))}
              </Select>
            )}
            
            {sites.length === 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateSite}
              >
                创建站点
              </Button>
            )}
            
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
            >
              <div className="header-user">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
                <span style={{ color: '#374151', fontWeight: 500 }}>
                  {user?.username || '用户'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 0, minHeight: 280 }}>
          <div className="main-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
