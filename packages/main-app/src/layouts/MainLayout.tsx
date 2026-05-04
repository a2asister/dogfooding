import React, { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Avatar, Badge, Button } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SafetyOutlined,
  KeyOutlined,
  TeamOutlined,
  FileTextOutlined,
  EyeOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '首页仪表盘',
  },
  {
    key: '/user',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/role',
    icon: <SafetyOutlined />,
    label: '角色管理',
  },
  {
    key: '/permission',
    icon: <KeyOutlined />,
    label: '权限管理',
  },
  {
    key: '/department',
    icon: <TeamOutlined />,
    label: '部门管理',
  },
  {
    key: '/log',
    icon: <FileTextOutlined />,
    label: '日志管理',
  },
  {
    key: '/audit',
    icon: <EyeOutlined />,
    label: '审计管理',
  },
  {
    key: '/ticket',
    icon: <FileSearchOutlined />,
    label: '工单管理',
  },
  {
    key: '/approval',
    icon: <CheckCircleOutlined />,
    label: '审批管理',
  },
  {
    key: '/message',
    icon: <Badge count={3} size="small"><BellOutlined /></Badge>,
    label: '消息中心',
  },
  {
    key: '/setting',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
]

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('/dashboard')
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    setSelectedKey(location.pathname || '/dashboard')
  }, [location.pathname])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/user/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/setting'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  const renderContent = () => {
    if (selectedKey === '/dashboard') {
      return (
        <div style={{ padding: '24px', background: '#fff', minHeight: '360px' }}>
          <h1 style={{ marginBottom: '24px' }}>SaaS 管理后台</h1>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>
            欢迎使用大型 SaaS 管理后台系统，本系统采用微前端 + 微服务架构。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ padding: '24px', background: '#f0f5ff', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px' }}>用户数量</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>1,234</p>
            </div>
            <div style={{ padding: '24px', background: '#f6ffed', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px' }}>角色数量</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>25</p>
            </div>
            <div style={{ padding: '24px', background: '#fffbe6', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px' }}>待处理工单</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>12</p>
            </div>
            <div style={{ padding: '24px', background: '#fff1f0', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '8px' }}>待审批</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>8</p>
            </div>
          </div>
          <div style={{ marginTop: '24px', padding: '24px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '16px' }}>架构说明</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}><strong>前端架构：</strong> 采用 qiankun 微前端框架，主应用 + 10 个子应用</li>
              <li style={{ marginBottom: '8px' }}><strong>后端架构：</strong> 采用 Express 微服务架构，每个子应用对应一个独立服务</li>
              <li style={{ marginBottom: '8px' }}><strong>数据存储：</strong> 使用本地 JSON 文件作为数据库，方便开发演示</li>
              <li style={{ marginBottom: '8px' }}><strong>技术栈：</strong> React 18 + TypeScript + Ant Design + Vite</li>
            </ul>
          </div>
        </div>
      )
    }
    return (
      <div id="micro-app-container" className="micro-app-container" />
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          margin: '16px',
          borderRadius: '8px',
        }}>
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
              SaaS 管理后台
            </span>
          )}
          {collapsed && (
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
              S
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: '64px', height: '64px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} onClick={() => navigate('/message')} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <Avatar size="small" icon={<UserOutlined />} src={currentUser?.avatar} />
                <span>{currentUser?.realName || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
