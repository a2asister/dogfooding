import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Dropdown, Avatar, Button, Typography, Badge } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { useAuthStore, roleDescriptions } from '../stores/authStore';
import { useHospitalStore } from '../stores/hospitalStore';
import { usePatientStore } from '../stores/patientStore';
import { useCommonStore } from '../stores/commonStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: '/patient/dashboard',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/patient/appointments',
    icon: <CalendarOutlined />,
    label: '预约挂号',
  },
  {
    key: '/patient/records',
    icon: <FileTextOutlined />,
    label: '病历报告',
  },
  {
    key: '/patient/orders',
    icon: <ShoppingOutlined />,
    label: '我的订单',
  },
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();
  const { loadAll: loadHospital } = useHospitalStore();
  const { loadAll: loadPatient } = usePatientStore();
  const { loadAll: loadCommon } = useCommonStore();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    loadHospital();
    loadPatient();
    loadCommon();
  }, [loadHospital, loadPatient, loadCommon]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'info',
      icon: <UserOutlined />,
      label: (
        <div>
          <div>{currentUser?.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {currentUser?.role ? roleDescriptions[currentUser.role] : ''}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const selectedKeys = [location.pathname];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      <Sider
        width={240}
        style={{
          background: '#001529',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <MedicineBoxOutlined style={{ fontSize: 28, color: '#1890ff', marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            患者服务中心
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: 240,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          flex: 1,
        }}
      >
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            height: 64,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
              患者服务平台
            </Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <Badge count={1} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
              />
            </Badge>

            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'background 0.3s',
                  whiteSpace: 'nowrap',
                  maxWidth: '250px',
                }}
              >
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', flexShrink: 0 }} />
                <div style={{ marginLeft: 8, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', lineHeight: 1.4, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
                  <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.role ? roleDescriptions[currentUser.role] : ''}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            background: '#f0f2f5',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 24,
              background: colorBgContainer,
              minHeight: '100%',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
