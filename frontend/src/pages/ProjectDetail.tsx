import React, { useEffect } from 'react'
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, Tabs, Button, Space, Tag, Typography, Breadcrumb, Dropdown, Menu, Avatar } from 'antd'
import { PlusOutlined, SettingOutlined, MoreOutlined, TeamOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { useProjectStore } from '@/stores/projectStore'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useUIStore } from '@/stores/uiStore'
import type { MenuProps } from 'antd'

const { Title, Text } = Typography

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentProject, fetchProject, fetchProjectStats, projectStats } = useProjectStore()
  const { fetchIssueTypes } = useIssueStore()
  const { fetchSprints, fetchVersions, fetchModules, fetchTags } = useProjectMetaStore()
  const { openModal, currentView, setCurrentView } = useUIStore()

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
      fetchProjectStats(projectId)
      fetchIssueTypes(projectId)
      fetchSprints(projectId)
      fetchVersions(projectId)
      fetchModules(projectId)
      fetchTags(projectId)
    }
  }, [projectId, fetchProject, fetchProjectStats, fetchIssueTypes, fetchSprints, fetchVersions, fetchModules, fetchTags])

  const getActiveKey = (): string => {
    const pathname = location.pathname
    if (pathname.includes('/board')) return 'board'
    if (pathname.includes('/list')) return 'list'
    if (pathname.includes('/backlog')) return 'backlog'
    if (pathname.includes('/sprints')) return 'sprints'
    if (pathname.includes('/versions')) return 'versions'
    if (pathname.includes('/reports')) return 'reports'
    if (pathname.includes('/settings')) return 'settings'
    return 'board'
  }

  const handleTabChange = (key: string) => {
    const routeMap: Record<string, string> = {
      board: 'board',
      list: 'list',
      backlog: 'backlog',
      sprints: 'sprints',
      versions: 'versions',
      reports: 'reports',
      settings: 'settings',
    }
    navigate(`/projects/${projectId}/${routeMap[key] || 'board'}`)
  }

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'import',
      label: '导入数据',
      icon: <FileTextOutlined />,
      onClick: () => openModal('importData'),
    },
    {
      key: 'export',
      label: '导出数据',
      icon: <FileTextOutlined />,
      onClick: () => openModal('exportData'),
    },
    {
      key: 'templates',
      label: '另存为模板',
      icon: <FileTextOutlined />,
      onClick: () => openModal('saveAsTemplate'),
    },
    {
      type: 'divider',
    },
    {
      key: 'archived',
      label: '归档项目',
      icon: <MoreOutlined />,
      danger: true,
      onClick: () => {
        if (currentProject) {
          openModal('archiveProject', { project: currentProject })
        }
      },
    },
  ]

  const tabItems = [
    {
      key: 'board',
      label: '看板',
    },
    {
      key: 'list',
      label: '列表',
    },
    {
      key: 'backlog',
      label: '待办事项',
    },
    {
      key: 'sprints',
      label: '迭代',
    },
    {
      key: 'versions',
      label: '版本',
    },
    {
      key: 'reports',
      label: '报表',
    },
    {
      key: 'settings',
      label: (
      <Space>
        <SettingOutlined />
        设置
      </Space>
    ),
    },
  ]

  if (!currentProject && !projectStats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text type="secondary">加载中...</Text>
      </div>
    )
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
              <Avatar
                size={48}
                style={{ backgroundColor: '#1890ff', fontSize: 24 }}
              >
                {currentProject?.name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {currentProject?.name}
                  <Tag color="blue" style={{ marginLeft: 8, fontSize: 14 }}>
                    {currentProject?.key}
                  </Tag>
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {currentProject?.description || '暂无描述'}
                </Text>
              </div>
            </div>
            
            {projectStats && (
            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>总事项数</Text>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{projectStats.totalIssues}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>进行中</Text>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
                  {projectStats.inProgressIssues}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>待办</Text>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#faad14' }}>
                  {projectStats.openIssues}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>已完成</Text>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
                  {projectStats.doneIssues}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>迭代数</Text>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {projectStats.sprintsTotal}
                </div>
              </div>
            </div>
          )}
          </div>

          <Space size="middle">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal('createIssue')}
              size="large"
            >
              新建事项
            </Button>
            <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
              <Button icon={<MoreOutlined />} size="large" />
            </Dropdown>
          </Space>
        </div>
      </Card>

      <Card bodyStyle={{ padding: '0 24px' }}>
        <Tabs
          activeKey={getActiveKey()}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          style={{ marginBottom: -1 }}
        />
      </Card>

      <div style={{ marginTop: 16 }}>
        <Outlet />
      </div>
    </div>
  )
}

export default ProjectDetail
