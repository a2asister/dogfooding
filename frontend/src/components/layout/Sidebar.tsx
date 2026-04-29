import React, { useMemo } from 'react'
import { Layout, Menu, theme } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  TagOutlined,
  FolderOutlined,
  BarChartOutlined,
  SettingOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UserOutlined,
  RiseOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const { sidebarCollapsed, setActiveSidebar, activeSidebar } = useUIStore()
  const { projects, currentProject } = useProjectStore()
  const { sprints, currentSprint, versions, modules, tags } = useProjectMetaStore()

  const isProjectPage = location.pathname.startsWith('/projects/') && projectId

  const globalMenuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目列表',
      onClick: () => navigate('/projects'),
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
  ]

  const projectMenuItems: MenuProps['items'] = useMemo(() => {
    if (!isProjectPage || !currentProject) return []

    const basePath = `/projects/${projectId}`

    return [
      {
        key: 'work',
        label: '工作空间',
        type: 'group',
        children: [
          {
            key: `${basePath}/board`,
            icon: <AppstoreOutlined />,
            label: '看板',
            onClick: () => navigate(`${basePath}/board`),
          },
          {
            key: `${basePath}/list`,
            icon: <FolderOutlined />,
            label: '列表',
            onClick: () => navigate(`${basePath}/list`),
          },
          {
            key: `${basePath}/backlog`,
            icon: <ProjectOutlined />,
            label: '待办事项',
            onClick: () => navigate(`${basePath}/backlog`),
          },
          {
            key: `${basePath}/gantt`,
            icon: <RiseOutlined />,
            label: '甘特图',
            onClick: () => navigate(`${basePath}/gantt`),
          },
          {
            key: `${basePath}/calendar`,
            icon: <ScheduleOutlined />,
            label: '日历',
            onClick: () => navigate(`${basePath}/calendar`),
          },
        ],
      },
      {
        key: 'planning',
        label: '规划与发布',
        type: 'group',
        children: [
          {
            key: `${basePath}/sprints`,
            icon: <CalendarOutlined />,
            label: '迭代',
            onClick: () => navigate(`${basePath}/sprints`),
            badge: currentSprint ? 1 : undefined,
          },
          {
            key: `${basePath}/versions`,
            icon: <TagOutlined />,
            label: '版本',
            onClick: () => navigate(`${basePath}/versions`),
            badge: versions.filter(v => v.status === 'unreleased').length || undefined,
          },
        ],
      },
      {
        key: 'organization',
        label: '组织与分类',
        type: 'group',
        children: [
          {
            key: 'modules',
            icon: <FolderOutlined />,
            label: '业务模块',
            children: modules.map(m => ({
              key: `module-${m.id}`,
              label: m.name,
              icon: <AppstoreOutlined />,
              onClick: () => navigate(`${basePath}/list?module=${m.id}`),
            })),
          },
          {
            key: 'tags',
            icon: <TagOutlined />,
            label: '标签',
            children: tags.map(t => ({
              key: `tag-${t.id}`,
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: t.color 
                  }} />
                  {t.name}
                </span>
              ),
              onClick: () => navigate(`${basePath}/list?tag=${t.id}`),
            })),
          },
        ],
      },
      {
        key: 'reports',
        label: '报表与分析',
        type: 'group',
        children: [
          {
            key: `${basePath}/reports`,
            icon: <BarChartOutlined />,
            label: '报表中心',
            onClick: () => navigate(`${basePath}/reports`),
          },
        ],
      },
      {
        key: 'settings',
        label: '设置',
        type: 'group',
        children: [
          {
            key: `${basePath}/settings`,
            icon: <SettingOutlined />,
            label: '项目设置',
            onClick: () => navigate(`${basePath}/settings`),
          },
        ],
      },
    ]
  }, [isProjectPage, currentProject, projectId, currentSprint, versions, modules, tags, navigate])

  const getSelectedKey = (): string => {
    const pathname = location.pathname
    if (isProjectPage) {
      const basePath = `/projects/${projectId}`
      
      if (pathname === basePath || pathname === `${basePath}/`) {
        return `${basePath}/board`
      }
      
      for (const item of projectMenuItems) {
        if (!item) continue
        if ('type' in item && item.type === 'group' && 'children' in item) {
          const children = item.children
          if (children && Array.isArray(children)) {
            for (const child of children) {
              if (child && 'key' in child && pathname === child.key) {
                return child.key as string
              }
            }
          }
        }
      }
    }
    
    for (const item of globalMenuItems) {
      if (item && 'key' in item && pathname === item.key) {
        return item.key as string
      }
    }
    
    return pathname
  }

  const getOpenKeys = (): string[] => {
    const openKeys: string[] = []
    if (location.pathname.includes('/sprints')) {
      openKeys.push('planning')
    }
    if (location.pathname.includes('/versions')) {
      openKeys.push('planning')
    }
    if (location.pathname.includes('module')) {
      openKeys.push('organization')
    }
    if (location.pathname.includes('tag')) {
      openKeys.push('organization')
    }
    if (location.pathname.includes('/reports')) {
      openKeys.push('reports')
    }
    if (location.pathname.includes('/settings')) {
      openKeys.push('settings')
    }
    return openKeys
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      theme="light"
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: '1px solid #f0f0f0',
        background: '#fff',
      }}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        padding: sidebarCollapsed ? 0 : '0 20px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(90deg, #1890ff 0%, #722ed1 100%)',
      }}>
        <span style={{
          fontSize: sidebarCollapsed ? 24 : 20,
          fontWeight: 'bold',
          color: '#fff',
        }}>
          {sidebarCollapsed ? 'PM' : 'Project Manager'}
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        {isProjectPage && currentProject ? (
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            defaultOpenKeys={getOpenKeys()}
            style={{ height: '100%', borderRight: 0 }}
            items={projectMenuItems}
          />
        ) : (
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
            items={globalMenuItems}
          />
        )}
      </div>
    </Sider>
  )
}

export default Sidebar
