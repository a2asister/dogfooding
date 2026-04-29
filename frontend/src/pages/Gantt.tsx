import React, { useEffect } from 'react'
import { Row, Col, Card, Space, Select, DatePicker, Button, Tag, Typography, Empty, Spin } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import GanttChart from '@/components/GanttChart'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useProjectStore } from '@/stores/projectStore'
import type { Issue } from '@/types'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const GanttPage: React.FC = () => {
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
            {currentProject?.name || '项目'} - 甘特图
          </Title>
          <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
            以时间线方式展示事项进度
          </Text>
        </div>
        <Space>
          <Tag color="blue">{issues.length} 个事项</Tag>
        </Space>
      </div>

      <GanttChart
        issues={issues}
        loading={isLoading}
        onIssueClick={handleIssueClick}
      />
    </div>
  )
}

export default GanttPage
