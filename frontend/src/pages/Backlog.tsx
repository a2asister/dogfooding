import React, { useEffect, useMemo, useState } from 'react'
import { Card, Tag, Avatar, Space, Dropdown, Button, Badge, Typography, Empty, Spin, Input, Select, Tooltip } from 'antd'
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  UserOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useUIStore } from '@/stores/uiStore'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import type { MenuProps } from 'antd'
import type { Issue, IssueStatus } from '@/types'
import { formatDuration, formatDate } from '@/utils'
import dayjs from 'dayjs'

const { Text } = Typography

interface KanbanColumn {
  id: string
  status: IssueStatus
  name: string
  color: string
  category: 'todo' | 'in_progress' | 'done'
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', status: 'todo', name: '待办', color: '#bfbfbf', category: 'todo' },
  { id: 'in_progress', status: 'in_progress', name: '进行中', color: '#1890ff', category: 'in_progress' },
  { id: 'review', status: 'review', name: '审核中', color: '#722ed1', category: 'in_progress' },
  { id: 'done', status: 'done', name: '已完成', color: '#52c41a', category: 'done' },
  { id: 'blocked', status: 'blocked', name: '已阻塞', color: '#f5222d', category: 'todo' },
]

const PRIORITY_COLORS: Record<string, string> = {
  highest: '#f5222d',
  high: '#fa8c16',
  medium: '#faad14',
  low: '#1890ff',
  lowest: '#8c8c8c',
}

interface IssueCardProps {
  issue: Issue
  onEdit?: (issue: Issue) => void
  onDelete?: (issue: Issue) => void
  onClick?: (issue: Issue) => void
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onEdit, onDelete, onClick }) => {
  const navigate = useNavigate()
  const { issueTypes } = useIssueStore()
  const { modules, tags } = useProjectMetaStore()

  const issueType = issueTypes.find(t => t.id === issue.issueTypeId)
  const issueTags = tags.filter((t: { id: string }) => issue.tagIds?.includes(t.id))
  const issueModules = modules.filter((m: { id: string }) => issue.moduleIds?.includes(m.id))

  const handleClick = () => {
    if (onClick) {
      onClick(issue)
    } else {
      navigate(`/issues/${issue.id}`)
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => onEdit?.(issue),
    },
    {
      key: 'link',
      icon: <LinkOutlined />,
      label: '关联事项',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => onDelete?.(issue),
    },
  ]

  const isOverdue = issue.dueDate && dayjs(issue.dueDate).isBefore(dayjs()) && !['done', 'closed'].includes(issue.status)

  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        border: '1px solid #e8e8e8',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      hoverable
      onClick={handleClick}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {issueType && (
            <Tag color={issueType.color} style={{ margin: 0 }}>
              {issueType.name}
            </Tag>
          )}
            <Text type="secondary" style={{ fontSize: 12 }}>{issue.issueKey}</Text>
          </div>

          <Text strong style={{ display: 'block', marginBottom: 8, wordBreak: 'break-word' }}>
            {issue.summary}
          </Text>

          {issueModules.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            {issueModules.map(m => (
            <Tag key={m.id} color="default" style={{ fontSize: 11, margin: 0, marginRight: 4 }}>
              {m.name}
            </Tag>
          ))}
          </div>
        )}

          {issueTags.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            {issueTags.map(t => (
            <Tag key={t.id} color={t.color} style={{ fontSize: 11, margin: 0, marginRight: 4 }}>
              {t.name}
            </Tag>
          ))}
          </div>
        )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Space size="middle">
              {issue.assigneeId && (
              <Tooltip title="负责人">
                <Space size={4}>
                  <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              </Tooltip>
            )}

              <Tooltip title="优先级">
                <FlagOutlined style={{ color: PRIORITY_COLORS[issue.priority] }} />
              </Tooltip>

              {issue.timeSpent !== undefined && issue.timeSpent !== null && issue.timeSpent > 0 && (
              <Tooltip title="已耗时">
                <Space size={4}>
                  <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDuration(issue.timeSpent as number)}
                  </Text>
                </Space>
              </Tooltip>
            )}

              {issue.dueDate && (
              <Tooltip title="截止日期">
                <Space size={4}>
                  <ClockCircleOutlined style={{ color: isOverdue ? '#f5222d' : '#8c8c8c' }} />
                  <Text style={{ fontSize: 12, color: isOverdue ? '#f5222d' : '#8c8c8c' }}>
                    {formatDate(issue.dueDate)}
                  </Text>
                </Space>
              </Tooltip>
            )}
            </Space>

            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  issues: Issue[]
  onAddIssue?: () => void
  onEditIssue?: (issue: Issue) => void
  onDeleteIssue?: (issue: Issue) => void
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  issues,
  onAddIssue,
  onEditIssue,
  onDeleteIssue,
}) => {
  const issueIds = issues.map(i => i.id)

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        flexShrink: 0,
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginRight: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space size="middle">
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: column.color,
            }}
          />
          <Text strong>{column.name}</Text>
          <Badge count={issues.length} showZero style={{ backgroundColor: column.color }} />
        </Space>
        <Button
          type="text"
          icon={<PlusOutlined />}
          size="small"
          onClick={onAddIssue}
        />
      </div>

      <div style={{ minHeight: 100 }}>
        {issues.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无事项"
            style={{ margin: '20px 0' }}
          />
        ) : (
          <SortableContext items={issueIds} strategy={rectSortingStrategy}>
            {issues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onEdit={onEditIssue}
              onDelete={onDeleteIssue}
            />
          ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}

const KanbanView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { issues, fetchIssues, updateIssue } = useIssueStore()
  const { kanbanConfig, openModal } = useUIStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (projectId) {
      setLoading(true)
      fetchIssues(projectId).finally(() => setLoading(false))
    }
  }, [projectId, fetchIssues])

  const columnsByStatus = useMemo(() => {
    const result: Record<string, Issue[]> = {}
    
    DEFAULT_COLUMNS.forEach(col => {
      result[col.status] = []
    })

    let filteredIssues = issues

    const statusFilter = searchParams.get('status')
    if (statusFilter) {
      filteredIssues = filteredIssues.filter(i => i.status === statusFilter)
    }

    const assigneeFilter = searchParams.get('assignee')
    if (assigneeFilter) {
      filteredIssues = filteredIssues.filter(i => i.assigneeId === assigneeFilter)
    }

    const sprintFilter = searchParams.get('sprint')
    if (sprintFilter) {
      filteredIssues = filteredIssues.filter(i => i.sprintId === sprintFilter)
    }

    const searchText = searchParams.get('search')
    if (searchText) {
      const lower = searchText.toLowerCase()
      filteredIssues = filteredIssues.filter(i => 
        i.summary.toLowerCase().includes(lower) ||
        i.issueKey.toLowerCase().includes(lower) ||
        (i.description && i.description.toLowerCase().includes(lower))
      )
    }

    const showSubTasks = kanbanConfig.showSubTasks
    if (!showSubTasks) {
      filteredIssues = filteredIssues.filter(i => !i.parentId)
    }

    filteredIssues.forEach(issue => {
      if (result[issue.status]) {
        result[issue.status].push(issue)
      }
    })

    return result
  }, [issues, searchParams, kanbanConfig.showSubTasks])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeIssue = issues.find(i => i.id === activeId)
    if (!activeIssue) return

    const targetColumn = DEFAULT_COLUMNS.find(col => col.id === overId)
    
    if (targetColumn) {
      await updateIssue(activeId, { status: targetColumn.status })
    } else {
      const overIssue = issues.find(i => i.id === overId)
      if (overIssue) {
        if (activeIssue.status === overIssue.status) {
          const sameStatusIssues = columnsByStatus[activeIssue.status] || []
          const activeIndex = sameStatusIssues.findIndex(i => i.id === activeId)
          const overIndex = sameStatusIssues.findIndex(i => i.id === overId)
          
          if (activeIndex !== -1 && overIndex !== -1) {
            const newOrder = arrayMove(sameStatusIssues, activeIndex, overIndex)
            newOrder.forEach(async (issue, index) => {
              await updateIssue(issue.id, { position: index })
            })
          }
        } else {
          await updateIssue(activeId, { status: overIssue.status })
        }
      }
    }
  }

  const handleEditIssue = (issue: Issue) => {
    openModal('editIssue', { issue })
  }

  const handleDeleteIssue = async (issue: Issue) => {
    if (window.confirm(`确定要删除事项 ${issue.issueKey} 吗？`)) {
      await updateIssue(issue.id, { deletedAt: new Date() })
    }
  }

  const handleAddIssue = () => {
    openModal('createIssue')
  }

  const activeIssue = activeId ? issues.find(i => i.id === activeId) : null

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索事项..."
            prefix={<FilterOutlined />}
            style={{ width: 240 }}
            allowClear
            value={searchParams.get('search') || ''}
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/projects/${projectId}/board?search=${encodeURIComponent(e.target.value)}`)
              } else {
                navigate(`/projects/${projectId}/board`)
              }
            }}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            value={searchParams.get('status') || undefined}
            onChange={(value) => {
              if (value) {
                navigate(`/projects/${projectId}/board?status=${value}`)
              } else {
                navigate(`/projects/${projectId}/board`)
              }
            }}
            options={DEFAULT_COLUMNS.map(col => ({
              label: col.name,
              value: col.status,
            }))}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchIssues(projectId || '')}
          >
            刷新
          </Button>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddIssue}
        >
          新建事项
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 0' }}>
          {DEFAULT_COLUMNS.map(column => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            issues={columnsByStatus[column.status] || []}
            onAddIssue={handleAddIssue}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
          />
        ))}
        </div>

        <DragOverlay>
          {activeIssue && (
          <div style={{ opacity: 0.9, transform: 'scale(1.02)' }}>
            <IssueCard issue={activeIssue} />
          </div>
        )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

const Backlog: React.FC = () => {
  return (
    <div>
      <KanbanView />
    </div>
  )
}

export default Backlog
