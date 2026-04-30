import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Badge, Button } from 'antd'
import {
  HomeOutlined,
  BulbOutlined,
  AppstoreOutlined,
  ScheduleOutlined,
  BellOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { alertApi } from '../services/api'
import styled from 'styled-components'

const { Header, Sider, Content } = Layout

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`

const StyledSider = styled(Sider)`
  background: #001529;
  
  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    
    .logo-icon {
      font-size: 24px;
      color: #1890ff;
    }
    
    .logo-text {
      margin-left: 8px;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }
  }
  
  .ant-menu {
    border-right: none;
  }
  
  .ant-menu-dark .ant-menu-item-selected {
    background-color: #1890ff !important;
    color: white !important;
    font-weight: 600;
  }
  
  .ant-menu-dark .ant-menu-item-selected .anticon {
    color: white !important;
  }
  
  .ant-menu-dark .ant-menu-item-selected:hover {
    background-color: #40a9ff !important;
  }
  
  .ant-menu-dark .ant-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .ant-menu-dark .ant-menu-item-active {
    background-color: rgba(24, 144, 255, 0.3);
  }
`

const StyledHeader = styled(Header)`
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .trigger {
    font-size: 20px;
    cursor: pointer;
    margin-right: 16px;
  }
`

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 112px);
`

const LayoutComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  
  useEffect(() => {
    fetchAlertStats()
  }, [])
  
  const fetchAlertStats = async () => {
    try {
      const response = await alertApi.getStats()
      setUnreadAlerts(response.data.data.unread || 0)
    } catch (error) {
      console.error('获取告警统计失败:', error)
    }
  }
  
  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '监控面板'
    },
    {
      key: '/devices',
      icon: <BulbOutlined />,
      label: '设备管理'
    },
    {
      key: '/scenes',
      icon: <AppstoreOutlined />,
      label: '场景管理'
    },
    {
      key: '/tasks',
      icon: <ScheduleOutlined />,
      label: '定时任务'
    },
    {
      key: '/alerts',
      icon: <Badge count={unreadAlerts}><BellOutlined /></Badge>,
      label: '告警中心'
    },
    {
      key: '/energy',
      icon: <ThunderboltOutlined />,
      label: '能耗统计'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ]
  
  const handleMenuClick = ({ key }) => {
    navigate(key)
  }
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.username || '用户'
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]
  
  return (
    <StyledLayout>
      <StyledSider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <HomeOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">智能家居</span>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </StyledSider>
      
      <Layout>
        <StyledHeader>
          <div className="header-left">
            {collapsed ? (
              <MenuUnfoldOutlined 
                className="trigger" 
                onClick={() => setCollapsed(false)} 
              />
            ) : (
              <MenuFoldOutlined 
                className="trigger" 
                onClick={() => setCollapsed(true)} 
              />
            )}
          </div>
          
          <div className="header-right">
            <Badge count={unreadAlerts}>
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                onClick={() => navigate('/alerts')}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: '8px' }}>{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </StyledHeader>
        
        <StyledContent>
          <Outlet />
        </StyledContent>
      </Layout>
    </StyledLayout>
  )
}

export default LayoutComponent