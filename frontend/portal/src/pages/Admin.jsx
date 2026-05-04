import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, message, Card, Row, Col, Typography, Tag } from 'antd';
import { 
  HomeOutlined, 
  SettingOutlined, 
  BarChartOutlined, 
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, subsystemAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { updateGlobalState } from '../micro';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const iconMap = {
  Settings: SettingOutlined,
  BarChart: BarChartOutlined,
  Document: FileTextOutlined,
};

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [subsystems, setSubsystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout, canAccessSubsystem } = useAuthStore();

  useEffect(() => {
    loadSubsystems();
  }, []);

  const loadSubsystems = async () => {
    try {
      const response = await subsystemAPI.getSubsystems();
      if (response.data.success) {
        setSubsystems(response.data.data);
      }
    } catch (error) {
      console.error('Load subsystems error:', error);
      message.error('加载子系统列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      updateGlobalState({ token: null, user: null });
      message.success('已退出登录');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      updateGlobalState({ token: null, user: null });
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'user',
      label: (
        <span>
          <UserOutlined /> {user?.name}
        </span>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span onClick={handleLogout}>
          <LogoutOutlined /> 退出登录
        </span>
      ),
    },
  ];

  const getMenuItems = () => {
    const items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页',
      },
    ];

    subsystems.forEach((subsystem) => {
      const IconComponent = iconMap[subsystem.icon] || SettingOutlined;
      items.push({
        key: `/${subsystem.id}`,
        icon: <IconComponent />,
        label: subsystem.name,
      });
    });

    return items;
  };

  const handleMenuClick = ({ key }) => {
    if (key === '/') {
      navigate('/');
    } else {
      const subsystemId = key.replace('/', '');
      if (canAccessSubsystem(subsystemId)) {
        navigate(key);
      } else {
        message.error('没有权限访问该子系统');
      }
    }
  };

  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '') {
      return ['/'];
    }
    return [pathname];
  };

  const renderHomePage = () => (
    <div>
      <Title level={3}>欢迎，{user?.name}</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        当前角色：{user?.roles?.join(', ')}
      </Text>
      
      <Title level={4}>可访问的子系统</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          加载中...
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {subsystems.length === 0 ? (
            <Col span={24}>
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Text type="secondary">暂无可用的子系统</Text>
                </div>
              </Card>
            </Col>
          ) : (
            subsystems.map((subsystem) => {
              const IconComponent = iconMap[subsystem.icon] || SettingOutlined;
              return (
                <Col xs={24} sm={12} md={8} key={subsystem.id}>
                  <Card
                    className="subsystem-card"
                    hoverable
                    onClick={() => {
                      if (canAccessSubsystem(subsystem.id)) {
                        navigate(`/${subsystem.id}`);
                      } else {
                        message.error('没有权限访问该子系统');
                      }
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div className="card-icon">
                        <IconComponent style={{ color: '#1890ff' }} />
                      </div>
                      <div className="card-title">{subsystem.name}</div>
                      <div className="card-description">{subsystem.description}</div>
                    </div>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      )}
      
      <Title level={4} style={{ marginTop: '40px' }}>权限信息</Title>
      <Card>
        <div>
        <Text strong>权限列表：</Text>
        <div style={{ marginTop: '8px' }}>
          {user?.permissions?.map(permission => (
            <Tag key={permission} color="blue">{permission}</Tag>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <Text strong>可访问子系统：</Text>
        <div style={{ marginTop: '8px' }}>
          {user?.subsystems?.map(subsystemId => {
            const subsystem = subsystems.find(s => s.id === subsystemId);
            return (
              <Tag key={subsystemId} color="green">
                {subsystem?.name || subsystemId}
              </Tag>
            );
          })}
        </div>
      </div>
      </Card>
    </div>
  );

  const isHomePage = location.pathname === '/' || location.pathname === '';

  return (
    <Layout className="main-layout">
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo">
          统一登录门户
        </div>
        
        <div className="header-right">
          <span className="user-info">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span>{user?.name}</span>
              </div>
            </Dropdown>
          </span>
        </div>
      </Header>
      
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={200}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            theme="dark"
            onClick={handleMenuClick}
            items={getMenuItems()}
          />
        </Sider>
        
        <Content>
          {isHomePage ? (
            <div style={{ margin: '24px', padding: '24px', background: '#fff', minHeight: '360px' }}>
              {renderHomePage()}
            </div>
          ) : (
            <div id="subapp-container" className="subapp-container" />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
