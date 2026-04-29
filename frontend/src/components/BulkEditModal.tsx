import React, { useMemo, useState } from 'react'
import { 
  Modal, Select, Button, Space, 
  Row, Col, Typography, Tag, Checkbox, Divider, message,
  Alert, Form, DatePicker
} from 'antd'
import { 
  CheckOutlined, UserOutlined, 
  FlagOutlined, CalendarOutlined, FolderOutlined,
  AppstoreOutlined, TagOutlined
} from '@ant-design/icons'
import type { 
  Issue, IssueStatus, Priority, User
} from '@/types'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import dayjs from 'dayjs'

const { Text } = Typography

interface BulkEditModalProps {
  open: boolean
  selectedIssueIds: string[]
  issues: Issue[]
  onClose: () => void
  onSuccess?: () => void
  projectId: string
  users?: User[]
}

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'review', label: '审核中' },
  { value: 'done', label: '已完成' },
  { value: 'closed', label: '已关闭' },
  { value: 'reopened', label: '重新打开' },
  { value: 'blocked', label: '已阻塞' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'highest', label: '最高', color: '#f5222d' },
  { value: 'high', label: '高', color: '#fa8c16' },
  { value: 'medium', label: '中', color: '#faad14' },
  { value: 'low', label: '低', color: '#1890ff' },
  { value: 'lowest', label: '最低', color: '#8c8c8c' },
]

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  open,
  selectedIssueIds,
  issues,
  onClose,
  onSuccess,
  projectId,
  users = [],
}) => {
  const [form] = Form.useForm()
  const { bulkUpdateIssues, isSubmitting } = useIssueStore()
  const { sprints, versions, modules, tags } = useProjectMetaStore()

  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({
    status: false,
    priority: false,
    assigneeId: false,
    sprintId: false,
    dueDate: false,
    moduleIds: false,
    tagIds: false,
    fixVersionIds: false,
  })

  const selectedIssues = useMemo(() => {
    return issues.filter(i => selectedIssueIds.includes(i.id))
  }, [issues, selectedIssueIds])

  const commonValues = useMemo(() => {
    if (selectedIssues.length === 0) return {}

    const result: Record<string, unknown> = {}

    const statuses = [...new Set(selectedIssues.map(i => i.status))]
    if (statuses.length === 1) result.status = statuses[0]

    const priorities = [...new Set(selectedIssues.map(i => i.priority))]
    if (priorities.length === 1) result.priority = priorities[0]

    const assignees = [...new Set(selectedIssues.map(i => i.assigneeId))]
    if (assignees.length === 1 && assignees[0]) result.assigneeId = assignees[0]

    const sprintIds = [...new Set(selectedIssues.map(i => i.sprintId))]
    if (sprintIds.length === 1 && sprintIds[0]) result.sprintId = sprintIds[0]

    const dueDates = [...new Set(selectedIssues.map(i => i.dueDate?.toString()))]
    if (dueDates.length === 1 && dueDates[0]) result.dueDate = dayjs(dueDates[0])

    return result
  }, [selectedIssues])

  const toggleField = (field: string) => {
    setEnabledFields(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue()
      const updates: Record<string, unknown> = {}

      if (enabledFields.status && values.status !== undefined) {
        updates.status = values.status
      }
      if (enabledFields.priority && values.priority !== undefined) {
        updates.priority = values.priority
      }
      if (enabledFields.assigneeId) {
        updates.assigneeId = values.assigneeId || null
      }
      if (enabledFields.sprintId) {
        updates.sprintId = values.sprintId || null
      }
      if (enabledFields.dueDate) {
        updates.dueDate = values.dueDate ? values.dueDate.toDate() : null
      }
      if (enabledFields.moduleIds) {
        updates.moduleIds = values.moduleIds || []
      }
      if (enabledFields.tagIds) {
        updates.tagIds = values.tagIds || []
      }
      if (enabledFields.fixVersionIds) {
        updates.fixVersionIds = values.fixVersionIds || []
      }

      if (Object.keys(updates).length === 0) {
        message.warning('请至少选择一个要修改的字段')
        return
      }

      const success = await bulkUpdateIssues(selectedIssueIds, updates as any)
      if (success) {
        message.success(`成功更新 ${selectedIssueIds.length} 个事项`)
        onClose()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Bulk edit error:', error)
      message.error('批量更新失败')
    }
  }

  const FieldToggle = ({ field, label, icon, children }: {
    field: string
    label: string
    icon: React.ReactNode
    children: React.ReactNode
  }) => (
    <div style={{ marginBottom: 16 }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 8,
          cursor: 'pointer',
        }}
        onClick={() => toggleField(field)}
      >
        <Checkbox checked={enabledFields[field]} />
        {icon}
        <Text strong={enabledFields[field]}>{label}</Text>
      </div>
      <div style={{ 
        marginLeft: 28,
        opacity: enabledFields[field] ? 1 : 0.5,
        pointerEvents: enabledFields[field] ? 'auto' : 'none',
      }}>
        {children}
      </div>
    </div>
  )

  return (
    <Modal
      title={
        <Space>
          <CheckOutlined />
          <span>批量编辑事项</span>
          <Tag color="blue">{selectedIssueIds.length} 个事项</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={720}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            确认修改
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={commonValues}
      >
        <Alert
          message={
            <Space>
              <CheckOutlined />
              <span>已选择 {selectedIssueIds.length} 个事项进行批量编辑</span>
            </Space>
          }
          description="勾选要修改的字段，然后设置新值。只有勾选的字段会被更新。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {selectedIssues.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {selectedIssues.slice(0, 10).map(issue => (
              <Tag key={issue.id}>{issue.issueKey}</Tag>
            ))}
            {selectedIssues.length > 10 && (
              <Tag color="default">+{selectedIssues.length - 10} 更多</Tag>
            )}
          </div>
        )}

        <Divider>选择要修改的字段</Divider>

        <Row gutter={24}>
          <Col span={12}>
            <FieldToggle
              field="status"
              label="状态"
              icon={<AppstoreOutlined />}
            >
              <Form.Item name="status" noStyle>
                <Select
                  placeholder="选择状态"
                  style={{ width: '100%' }}
                  options={STATUS_OPTIONS.map(opt => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="priority"
              label="优先级"
              icon={<FlagOutlined />}
            >
              <Form.Item name="priority" noStyle>
                <Select
                  placeholder="选择优先级"
                  style={{ width: '100%' }}
                  options={PRIORITY_OPTIONS.map(opt => ({
                    value: opt.value,
                    label: (
                      <Space>
                        <span style={{ color: opt.color }}>●</span>
                        {opt.label}
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="assigneeId"
              label="负责人"
              icon={<UserOutlined />}
            >
              <Form.Item name="assigneeId" noStyle>
                <Select
                  placeholder="选择负责人（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                  options={users.map(u => ({
                    value: u.id,
                    label: u.displayName || u.username,
                  }))}
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="sprintId"
              label="迭代"
              icon={<CalendarOutlined />}
            >
              <Form.Item name="sprintId" noStyle>
                <Select
                  placeholder="选择迭代（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                  options={sprints.map(s => ({
                    value: s.id,
                    label: (
                      <Space>
                        {s.name}
                        <Tag color={
                          s.status === 'active' ? 'processing' :
                          s.status === 'completed' ? 'success' : 'default'
                        }>
                          {s.status === 'active' ? '进行中' :
                           s.status === 'completed' ? '已完成' : '计划中'}
                        </Tag>
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </FieldToggle>
          </Col>

          <Col span={12}>
            <FieldToggle
              field="dueDate"
              label="截止日期"
              icon={<CalendarOutlined />}
            >
              <Form.Item name="dueDate" noStyle>
                <DatePicker
                  placeholder="选择截止日期（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="moduleIds"
              label="业务模块"
              icon={<FolderOutlined />}
            >
              <Form.Item name="moduleIds" noStyle>
                <Select
                  mode="multiple"
                  placeholder="选择模块（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                  options={modules.map(m => ({
                    value: m.id,
                    label: m.name,
                  }))}
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="tagIds"
              label="标签"
              icon={<TagOutlined />}
            >
              <Form.Item name="tagIds" noStyle>
                <Select
                  mode="multiple"
                  placeholder="选择标签（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                  options={tags.map(t => ({
                    value: t.id,
                    label: (
                      <Space>
                        <span style={{ 
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: t.color,
                        }} />
                        {t.name}
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </FieldToggle>

            <FieldToggle
              field="fixVersionIds"
              label="修复版本"
              icon={<TagOutlined />}
            >
              <Form.Item name="fixVersionIds" noStyle>
                <Select
                  mode="multiple"
                  placeholder="选择版本（不选则清空）"
                  style={{ width: '100%' }}
                  allowClear
                  options={versions.map(v => ({
                    value: v.id,
                    label: (
                      <Space>
                        {v.name}
                        {v.isReleased && <Tag color="success">已发布</Tag>}
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>
            </FieldToggle>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default BulkEditModal
