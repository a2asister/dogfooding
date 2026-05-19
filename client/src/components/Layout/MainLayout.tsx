import { Layout, Menu, Badge, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  WalletOutlined,
  ShoppingOutlined,
  HeartOutlined,
  MessageOutlined,
  ShopOutlined,
  SettingOutlined,
  DashboardOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { useEffect, useState } from 'react';
import { messageApi } from '../../services/api';

const { Header, Content, Sider } = Layout;

function MainLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      messageApi.getUnread().then((res) => setUnreadCount(res.unreadCount));
    }
  }, [user]);

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/auction', icon: <ShoppingOutlined />, label: '拍卖商品' },
    { key: '/profile', icon: <UserOutlined />, label: '个人中心' },
    { key: '/deposit', icon: <WalletOutlined />, label: '保证金' },
    { key: '/orders', icon: <ShoppingOutlined />, label: '我的订单' },
    { key: '/favorites', icon: <HeartOutlined />, label: '我的收藏' },
    { key: '/messages', icon: <Badge count={unreadCount}><MessageOutlined /></Badge>, label: '消息中心' }
  ];

  const merchantMenuItems = [
    ...userMenuItems,
    { type: 'divider' as const },
    { key: '/merchant/auctions', icon: <ShopOutlined />, label: '商品管理' },
    { key: '/merchant/auction/new', icon: <ShopOutlined />, label: '发布商品' },
    { key: '/merchant/orders', icon: <ShoppingOutlined />, label: '交易订单' },
    { key: '/merchant/auth', icon: <SettingOutlined />, label: '商家认证' }
  ];

  const operatorMenuItems = [
    { key: '/operator', icon: <DashboardOutlined />, label: '运营总览' },
    { key: '/operator/auctions', icon: <ShopOutlined />, label: '拍卖管理' },
    { key: '/operator/orders', icon: <ShoppingOutlined />, label: '订单管理' }
  ];

  const adminMenuItems = [
    ...operatorMenuItems,
    { type: 'divider' as const },
    { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/admin/merchants', icon: <ShopOutlined />, label: '商家管理' },
    { key: '/admin/auctions', icon: <ShopOutlined />, label: '拍卖商品审核' },
    { key: '/admin/orders', icon: <ShoppingOutlined />, label: '订单管理' },
    { key: '/admin/config', icon: <SettingOutlined />, label: '系统配置' }
  ];

  const getMenuItems = () => {
    if (!user) return userMenuItems;
    if (user.role === UserRole.ADMIN) return adminMenuItems;
    if (user.role === UserRole.OPERATOR) return operatorMenuItems;
    if (user.role === UserRole.MERCHANT) return merchantMenuItems;
    return userMenuItems;
  };

  const userDropdownItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>
          🏷️ 拍卖竞价系统
        </div>
        {user && (
          <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.nickname}</span>
            </div>
          </Dropdown>
        )}
      </Header>
      <Layout>
        <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.split('/').slice(0, 2).join('/')]}
            style={{ height: '100%', borderRight: 0 }}
            items={getMenuItems()}
            onClick={({ key }) => navigate(key as string)}
          />
        </Sider>
        <Layout style={{ padding: '24px', background: '#f5f5f5' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
