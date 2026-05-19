import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  ExperimentOutlined,
  CustomerServiceOutlined,
  LoginOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const PortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/about', icon: <InfoCircleOutlined />, label: '学校概况' },
    { key: '/news', icon: <FileTextOutlined />, label: '新闻动态' },
    { key: '/admission', icon: <BookOutlined />, label: '招生就业' },
    { key: '/research', icon: <ExperimentOutlined />, label: '教学科研' },
    { key: '/services', icon: <CustomerServiceOutlined />, label: '公共服务' },
  ];

  return (
    <Layout className="portal-container">
      <Header
        style={{
          background: '#fff',
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '22px', fontWeight: '600', color: '#1677ff' }}>🎓 大学门户</div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ minWidth: '500px' }}
          />
        </div>
        <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
          统一登录
        </Button>
      </Header>
      <Content className="portal-main">
        <div className="portal-content">
          <Outlet />
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div style={{ color: '#666', fontSize: '13px' }}>
          <p>© 2024 大学门户系统 版权所有</p>
          <p>地址：XX省XX市XX区XX路100号 邮编：100000 电话：010-12345678 邮箱：info@university.edu.cn</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default PortalLayout;
