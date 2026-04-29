import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Tag, Button, Space, Descriptions, Divider, Avatar, Input, List, Popconfirm, message, Badge, Tooltip, Select, DatePicker, Progress, Statistic, Row, Col, Dropdown, Menu, Empty } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  CommentOutlined,
  FileTextOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatDuration } from '@/utils'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const IssueDetail: React.FC = () => {
  const { issueId } = useParams<{ issueId: string }>()
  const navigate = useNavigate()
  const { currentIssue, fetchIssue, updateIssue, deleteIssue, issueTypes, issues, issueLinks } = useIssueStore()
  const { currentProject } = useProjectStore()
  const { currentUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (issueId) {
      fetchIssue(issueId)
    }
  }, [issueId, fetchIssue])

  const handleDelete = () => {
    if (currentIssue) {
      deleteIssue(currentIssue.id)
      navigate(`/projects/${currentProject?.id}/board`)
      message.success('事项已删除')
    }
  }

  const issueType = currentIssue ? issueTypes.find(t => t.id === currentIssue.issueTypeId) : undefined
  const linkedIssues = currentIssue ? issueLinks.filter(l => l.sourceIssueId === currentIssue.id || l.targetIssueId === currentIssue.id) : []

  const priorityColors: Record<string, string> = {
    highest: '#f5222d',
    high: '#fa8c16',
    medium: '#faad14',
    low: '#1890ff',
    lowest: '#8c8c8c',
  }

  const priorityLabels: Record<string, string> = {
    highest: '最高',
    high: '高',
    medium: '中',
    low: '低',
    lowest: '最低',
  }

  const statusColors: Record<string, string> = {
    todo: '#bfbfbf',
    in_progress: '#1890ff',
    review: '#722ed1',
    done: '#52c41a',
    closed: '#8c8c8c',
    blocked: '#f5222d',
    reopened: '#fa8c16',
  }

  const statusLabels: Record<string, string> = {
    todo: '待办',
    in_progress: '进行中',
    review: '审核中',
    done: '已完成',
    closed: '已关闭',
    blocked: '已阻塞',
    reopened: '重新打开',
  }

  if (!currentIssue) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Empty description="事项不存在" />
        <Button
          style={{ marginTop: 16 }}
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <div>
            <Text type="secondary" style={{ display: 'block' }}>{currentIssue.issueKey}</Text>
            <Title level={3} style={{ margin: 0 }}>{currentIssue.summary}</Title>
          </div>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => setIsEditing(!isEditing)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此事项吗？"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {issueType && (
              <Tag color={issueType.color} icon={<FileTextOutlined />}>
                {issueType.name}
              </Tag>
            )}
              <Tag color={statusColors[currentIssue.status]}>
                {statusLabels[currentIssue.status]}
              </Tag>
              <Tag icon={<TagOutlined />} style={{ color: priorityColors[currentIssue.priority], borderColor: priorityColors[currentIssue.priority] }}>
                优先级: {priorityLabels[currentIssue.priority]}
              </Tag>
            </div>

            {currentIssue.description && (
            <>
              <Divider>描述</Divider>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {currentIssue.description}
              </div>
            </>
          )}
          </Card>

          <Card title={
            <Space>
              <CommentOutlined />
              评论
            </Space>
          } extra={
            <Tag>0 条评论</Tag>
          }>
            <div style={{ marginBottom: 16 }}>
              <TextArea
                rows={3}
                placeholder="添加评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Button type="primary" disabled={!commentText.trim()}>
                  添加评论
                </Button>
              </div>
            </div>
            <Empty description="暂无评论" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="状态">
                <Select
                  value={currentIssue.status}
                  style={{ width: '100%' }}
                  onChange={(value) => updateIssue(currentIssue.id, { status: value })}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                  <Option key={key} value={key}>
                    <Tag color={statusColors[key]}>{label}</Tag>
                  </Option>
                ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="负责人">
                <Space>
                  <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <Select
                    placeholder="选择负责人"
                    value={currentIssue.assigneeId || undefined}
                    style={{ width: 150 }}
                    allowClear
                    onChange={(value) => updateIssue(currentIssue.id, { assigneeId: value || null })}
                  >
                    {currentUser && (
                    <Option key={currentUser.id} value={currentUser.id}>
                      {currentUser.displayName || currentUser.username}
                    </Option>
                  )}
                  </Select>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="创建人">
                <Space>
                  <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                  <Text>{currentUser?.displayName || '未知'}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="优先级">
                <Select
                  value={currentIssue.priority}
                  style={{ width: '100%' }}
                  onChange={(value) => updateIssue(currentIssue.id, { priority: value })}
                >
                  {Object.entries(priorityLabels).map(([key, label]) => (
                  <Option key={key} value={key}>
                    <Tag color={priorityColors[key]}>{label}</Tag>
                  </Option>
                ))}
                </Select>
              </Descriptions.Item>

              <Descriptions.Item label="截止日期">
                <DatePicker
                  value={currentIssue.dueDate ? dayjs(currentIssue.dueDate) : null}
                  style={{ width: '100%' }}
                  onChange={(date) => updateIssue(currentIssue.id, { dueDate: date?.toDate() || null })}
                  placeholder="选择截止日期"
                  allowClear
                />
              </Descriptions.Item>

              <Descriptions.Item label="创建时间">
                {formatDate(currentIssue.createdAt, 'YYYY-MM-DD HH:mm')}
              </Descriptions.Item>

              <Descriptions.Item label="更新时间">
                {formatDate(currentIssue.updatedAt, 'YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="工时统计" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title="预计工时"
                  value={currentIssue.originalEstimate ? formatDuration(currentIssue.originalEstimate) : '-'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="已耗时"
                  value={currentIssue.timeSpent ? formatDuration(currentIssue.timeSpent) : '0m'}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="剩余工时"
                  value={currentIssue.remainingEstimate ? formatDuration(currentIssue.remainingEstimate) : '-'}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              {currentIssue.originalEstimate && currentIssue.originalEstimate > 0 && (
              <Col span={24}>
                <Progress
                  percent={Math.round(((currentIssue.timeSpent || 0) / currentIssue.originalEstimate) * 100)}
                  format={percent => `${percent}%`}
                />
              </Col>
            )}
            </Row>
          </Card>

          {linkedIssues.length > 0 && (
          <Card title={
            <Space>
              <LinkOutlined />
              关联事项
            </Space>
          } extra={
            <Button type="link" size="small" icon={<PlusOutlined />}>
              添加关联
            </Button>
          }>
            <List
              size="small"
              dataSource={linkedIssues}
              renderItem={(link) => {
                const isSource = link.sourceIssueId === currentIssue.id
                const linkedIssueId = isSource ? link.targetIssueId : link.sourceIssueId
                const linkedIssue = issues.find(i => i.id === linkedIssueId)
                
                const linkTypeLabels: Record<string, string> = {
                  blocks: '阻塞',
                  blocked_by: '被阻塞',
                  relates_to: '关联',
                  duplicates: '重复',
                  is_duplicated_by: '被重复',
                  depends_on: '依赖',
                  is_dependency_of: '被依赖',
                }
                
                return (
                <List.Item
                  actions={[
                    <Button type="link" size="small">查看</Button>,
                    <Button type="link" size="small" danger>移除</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Tag color={statusColors[linkedIssue?.status || 'todo']}>
                        {linkTypeLabels[link.linkType] || link.linkType}
                      </Tag>
                    }
                    title={
                      <a onClick={() => navigate(`/issues/${linkedIssueId}`)}>
                        {linkedIssue?.issueKey || linkedIssueId}
                      </a>
                    }
                    description={linkedIssue?.summary}
                  />
                </List.Item>
              )
            }}
            />
          </Card>
        )}
        </Col>
      </Row>
    </div>
  )
}

export default IssueDetail
