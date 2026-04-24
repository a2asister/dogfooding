import React, { useState } from 'react'
import { Layout, Menu, theme, Button, Avatar, Dropdown, Badge } from 'antd'
import {
  DashboardOutlined,
  RocketOutlined,
  UserOutlined,
  SnippetsOutlined,
  ScheduleOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore, useGlobalStore } from '@/store/authStore'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '运营概览',
  },
  {
    key: '/flight',
    icon: <RocketOutlined />,
    label: '航班管理',
  },
  {
    key: '/passenger',
    icon: <UserOutlined />,
    label: '旅客服务',
  },
  {
    key: '/baggage',
    icon: <SnippetsOutlined />,
    label: '行李管理',
  },
  {
    key: '/resource',
    icon: <ScheduleOutlined />,
    label: '资源调度',
  },
  {
    key: '/security',
    icon: <SafetyCertificateOutlined />,
    label: '安防应急',
  },
  {
    key: '/equipment',
    icon: <ToolOutlined />,
    label: '设备运维',
  },
  {
    key: '/data',
    icon: <BarChartOutlined />,
    label: '数据决策',
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      {
        key: '/system/users',
        icon: <TeamOutlined />,
        label: '账号管理',
      },
      {
        key: '/system/roles',
        icon: <SafetyCertificateOutlined />,
        label: '角色权限',
      },
      {
        key: '/system/logs',
        icon: <FileTextOutlined />,
        label: '操作日志',
      },
    ],
  },
]

const AppLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, setSidebarCollapsed } = useGlobalStore()
  const [selectedKey, setSelectedKey] = useState(location.pathname)

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key)
    navigate(e.key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: '修改密码',
      icon: <SafetyCertificateOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <RocketOutlined
            style={{
              fontSize: 24,
              color: '#fff',
            }}
          />
          {!sidebarCollapsed && (
            <span
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                marginLeft: 8,
              }}
            >
              机场运营系统
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['system']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 240 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: 8,
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                  {user?.name || '管理员'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
