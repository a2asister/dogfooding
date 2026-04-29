import React, { useState } from 'react'
import { Layout, Dropdown, Avatar, Button, Space, Breadcrumb, Badge, Input } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'

const { Header: AntHeader } = Layout

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, openModal } = useUIStore()
  const { currentProject } = useProjectStore()
  const [searchText, setSearchText] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const quickCreateItems: MenuProps['items'] = [
    {
      key: 'project',
      label: '新建项目',
      icon: <PlusOutlined />,
      onClick: () => openModal('createProject'),
    },
    {
      key: 'issue',
      label: '新建事项',
      icon: <PlusOutlined />,
      onClick: () => openModal('createIssue'),
    },
    {
      key: 'sprint',
      label: '新建迭代',
      icon: <PlusOutlined />,
      onClick: () => openModal('createSprint'),
    },
  ]

  const getBreadcrumbItems = () => {
    const items: { key: string; title: React.ReactNode; onClick?: () => void }[] = [
      { key: 'home', title: <a onClick={() => navigate('/dashboard')}>首页</a>, onClick: () => navigate('/dashboard') },
    ]

    if (location.pathname.startsWith('/projects/') && currentProject) {
      items.push(
        { key: 'projects', title: <a onClick={() => navigate('/projects')}>项目</a>, onClick: () => navigate('/projects') },
        { key: 'project', title: currentProject.name }
      )

      const pathParts = location.pathname.split('/')
      const lastPart = pathParts[pathParts.length - 1]

      const subPages: Record<string, string> = {
        board: '看板',
        list: '列表',
        backlog: '待办事项',
        sprints: '迭代',
        versions: '版本',
        reports: '报表',
        settings: '设置',
      }

      if (subPages[lastPart]) {
        items.push({ key: 'subpage', title: subPages[lastPart] })
      }
    } else if (location.pathname === '/dashboard') {
      items.push({ key: 'dashboard', title: '仪表盘' })
    } else if (location.pathname === '/projects') {
      items.push({ key: 'projects', title: '项目列表' })
    } else if (location.pathname.startsWith('/issues/')) {
      items.push({ key: 'issues', title: '事项详情' })
    } else if (location.pathname === '/profile') {
      items.push({ key: 'profile', title: '个人中心' })
    }

    return items
  }

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          style={{ fontSize: '16px', width: 48, height: 48 }}
        />
        <Breadcrumb style={{ marginLeft: 16 }} items={getBreadcrumbItems()} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input.Search
          placeholder="全局搜索..."
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => {
            if (value.trim()) {
              navigate(`/projects/${currentProject?.id || ''}?search=${encodeURIComponent(value)}`)
            }
          }}
          prefix={<SearchOutlined style={{ color: '#999' }} />}
        />

        <Dropdown menu={{ items: quickCreateItems }} placement="bottomRight">
          <Button type="primary" icon={<PlusOutlined />}>
            新建
          </Button>
        </Dropdown>

        <Button type="text" icon={<GlobalOutlined />} title="语言" />
        <Button type="text" icon={<QuestionCircleOutlined />} title="帮助" />
        
        <Badge count={3} showZero>
          <Button type="text" icon={<BellOutlined />} title="通知" />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 4 }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={currentUser?.avatar}
              style={{ backgroundColor: '#1890ff' }}
            />
            <span style={{ fontSize: 14 }}>{currentUser?.displayName || currentUser?.username}</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
