import { Layout as AntLayout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCardOutlined,
  TransactionOutlined,
  BarChartOutlined,
  TagOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = AntLayout;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const menuItems = [
    {
      key: '/cards',
      icon: <CreditCardOutlined />,
      label: '银行卡管理'
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: '交易记录'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '账单统计'
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: '标签管理'
    },
    {
      key: '/categories',
      icon: <SettingOutlined />,
      label: '账户分类'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: colorBgContainer }}
      >
        <div style={{ 
          height: 64, 
          margin: 16, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          <CreditCardOutlined style={{ marginRight: 8, fontSize: 24 }} />
          银行卡管理
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>欢迎, {user?.username}</span>
            <LogoutOutlined 
              onClick={handleLogout} 
              style={{ cursor: 'pointer', fontSize: 18 }}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
