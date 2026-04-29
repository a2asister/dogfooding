import React, { useEffect } from 'react'
import { Row, Col, Card, Space, Select, Button, Tag, Typography, Empty, Spin } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import CalendarView from '@/components/CalendarView'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useProjectStore } from '@/stores/projectStore'
import type { Issue } from '@/types'

const { Title, Text } = Typography

const CalendarPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { issues, fetchIssues, isLoading } = useIssueStore()
  const { sprints, fetchSprints, versions, fetchVersions, modules, fetchModules, tags, fetchTags } = useProjectMetaStore()
  const { currentProject, fetchProject } = useProjectStore()

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
      fetchIssues(projectId)
      fetchSprints(projectId)
      fetchVersions(projectId)
      fetchModules(projectId)
      fetchTags(projectId)
    }
  }, [projectId, fetchProject, fetchIssues, fetchSprints, fetchVersions, fetchModules, fetchTags])

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issues/${issue.id}`)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {currentProject?.name || '项目'} - 日历
          </Title>
          <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
            以日历方式查看事项安排
          </Text>
        </div>
        <Space>
          <Tag color="blue">{issues.length} 个事项</Tag>
        </Space>
      </div>

      <CalendarView
        issues={issues}
        loading={isLoading}
        onIssueClick={handleIssueClick}
      />
    </div>
  )
}

export default CalendarPage
