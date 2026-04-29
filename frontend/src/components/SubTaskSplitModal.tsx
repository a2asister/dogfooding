import React, { useState } from 'react'
import {
  Modal, Form, Input, Select, DatePicker, InputNumber,
  Button, Space, Card, Row, Col, Typography, Tag, Divider,
  List, Popconfirm, message, Alert
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, ScissorOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import type { Issue, Priority, User } from '@/types'
import { useIssueStore } from '@/stores/issueStore'
import dayjs from 'dayjs'

const { Text } = Typography
const { TextArea } = Input

interface SubTaskSplitModalProps {
  open: boolean
  parentIssue: Issue | null
  onClose: () => void
  onSuccess?: () => void
  projectId: string
  users?: User[]
}

interface SubTaskFormData {
  summary: string
  description?: string
  assigneeId?: string
  priority?: Priority
  dueDate?: dayjs.Dayjs
  originalEstimate?: number
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'highest', label: '最高', color: '#f5222d' },
  { value: 'high', label: '高', color: '#fa8c16' },
  { value: 'medium', label: '中', color: '#faad14' },
  { value: 'low', label: '低', color: '#1890ff' },
  { value: 'lowest', label: '最低', color: '#8c8c8c' },
]

const SubTaskSplitModal: React.FC<SubTaskSplitModalProps> = ({
  open,
  parentIssue,
  onClose,
  onSuccess,
  projectId,
  users = [],
}) => {
  const { createIssue, isSubmitting, issueTypes } = useIssueStore()

  const [subTasks, setSubTasks] = useState<SubTaskFormData[]>([
    { summary: '', priority: 'medium' },
  ])

  const addSubTask = () => {
    setSubTasks([
      ...subTasks,
      { 
        summary: '', 
        priority: parentIssue?.priority || 'medium' as Priority,
        assigneeId: parentIssue?.assigneeId || undefined,
      },
    ])
  }

  const removeSubTask = (index: number) => {
    if (subTasks.length <= 1) {
      message.warning('至少需要一个子任务')
      return
    }
    setSubTasks(subTasks.filter((_, i) => i !== index))
  }

  const updateSubTask = (index: number, field: keyof SubTaskFormData, value: unknown) => {
    const updated = [...subTasks]
    updated[index] = { ...updated[index], [field]: value }
    setSubTasks(updated)
  }

  const splitEstimates = (totalEstimate: number) => {
    const updated = subTasks.map((task, index) => ({
      ...task,
      originalEstimate: Math.round(totalEstimate / subTasks.length),
    }))
    setSubTasks(updated)
    message.info(`已将 ${totalEstimate} 分钟平均分配到 ${subTasks.length} 个子任务`)
  }

  const handleSubmit = async () => {
    if (!parentIssue) {
      message.error('请选择要拆分的事项')
      return
    }

    const validSubTasks = subTasks.filter(t => t.summary.trim())
    if (validSubTasks.length === 0) {
      message.warning('请至少填写一个子任务的标题')
      return
    }

    try {
      const subTaskType = issueTypes.find(t => t.type === 'subtask') || issueTypes[0]
      if (!subTaskType) {
        message.error('未找到子任务类型配置')
        return
      }

      for (const subTaskData of validSubTasks) {
        await createIssue({
          projectId,
          issueTypeId: subTaskType.id,
          summary: subTaskData.summary,
          description: subTaskData.description,
          assigneeId: subTaskData.assigneeId,
          priority: subTaskData.priority,
          originalEstimate: subTaskData.originalEstimate,
          dueDate: subTaskData.dueDate?.toDate(),
          parentId: parentIssue.id,
          sprintId: parentIssue.sprintId || undefined,
          versionIds: parentIssue.versionIds,
          moduleIds: parentIssue.moduleIds,
          tagIds: parentIssue.tagIds,
        })
      }

      message.success(`成功拆分为 ${validSubTasks.length} 个子任务`)
      setSubTasks([{ summary: '', priority: 'medium' }])
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Split issue error:', error)
      message.error('拆分子任务失败')
    }
  }

  const totalEstimate = subTasks.reduce(
    (sum, t) => sum + (t.originalEstimate || 0), 
    0
  )

  return (
    <Modal
      title={
        <Space>
          <ScissorOutlined />
          <span>拆分子任务</span>
          {parentIssue && <Tag color="blue">{parentIssue.issueKey}</Tag>}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            确认拆分
          </Button>
        </Space>
      }
    >
      {parentIssue && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Text type="secondary">原事项：</Text>
              <div style={{ marginTop: 4 }}>
                <Tag>{parentIssue.issueKey}</Tag>
                <Text strong>{parentIssue.summary}</Text>
              </div>
            </Col>
            <Col span={6}>
              <Text type="secondary">原预估工时：</Text>
              <div style={{ marginTop: 4 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                <Text strong>
                  {parentIssue.originalEstimate 
                    ? `${parentIssue.originalEstimate} 分钟` 
                    : '未设置'}
                </Text>
              </div>
            </Col>
            <Col span={6}>
              <Text type="secondary">当前子任务预估：</Text>
              <div style={{ marginTop: 4 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                <Text strong>{totalEstimate} 分钟</Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Alert
        message="拆分子任务说明"
        description={
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>原事项将作为父事项，新创建的事项将作为其子任务</li>
            <li>子任务将继承原事项的迭代、模块、标签等信息</li>
            <li>可以通过"平均分配"按钮将原事项的预估工时平均分配到子任务</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Divider>子任务列表</Divider>

      <div style={{ marginBottom: 16 }}>
        <List
          dataSource={subTasks}
          locale={{ emptyText: '暂无子任务' }}
          renderItem={(subTask, index) => (
            <List.Item
              style={{ padding: 16, background: '#fafafa', marginBottom: 8, borderRadius: 4 }}
              actions={[
                <Popconfirm
                  key="delete"
                  title="确定要删除这个子任务吗？"
                  onConfirm={() => removeSubTask(index)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    删除
                  </Button>
                </Popconfirm>
              ]}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Tag color="blue">子任务 {index + 1}</Tag>
                </div>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="标题"
                      required
                      style={{ marginBottom: 12 }}
                    >
                      <Input
                        placeholder="请输入子任务标题"
                        value={subTask.summary}
                        onChange={(e) => updateSubTask(index, 'summary', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="描述" style={{ marginBottom: 12 }}>
                      <TextArea
                        placeholder="请输入子任务描述（可选）"
                        rows={2}
                        value={subTask.description}
                        onChange={(e) => updateSubTask(index, 'description', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="负责人" style={{ marginBottom: 12 }}>
                      <Select
                        placeholder="选择负责人"
                        allowClear
                        style={{ width: '100%' }}
                        value={subTask.assigneeId}
                        onChange={(value) => updateSubTask(index, 'assigneeId', value)}
                        options={users.map(u => ({
                          value: u.id,
                          label: u.displayName || u.username,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="优先级" style={{ marginBottom: 12 }}>
                      <Select
                        placeholder="选择优先级"
                        style={{ width: '100%' }}
                        value={subTask.priority}
                        onChange={(value) => updateSubTask(index, 'priority', value)}
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
                  </Col>

                  <Col span={6}>
                    <Form.Item label="截止日期" style={{ marginBottom: 12 }}>
                      <DatePicker
                        placeholder="选择截止日期"
                        style={{ width: '100%' }}
                        value={subTask.dueDate}
                        onChange={(date) => updateSubTask(index, 'dueDate', date)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item label="预估工时（分钟）" style={{ marginBottom: 12 }}>
                      <InputNumber
                        placeholder="预估工时"
                        style={{ width: '100%' }}
                        min={0}
                        value={subTask.originalEstimate}
                        onChange={(value) => updateSubTask(index, 'originalEstimate', value)}
                        addonAfter="分钟"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </List.Item>
          )}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addSubTask}
          >
            添加子任务
          </Button>
          {parentIssue?.originalEstimate && (
            <Button
              onClick={() => splitEstimates(parentIssue.originalEstimate!)}
            >
              平均分配工时
            </Button>
          )}
        </Space>
        <Text type="secondary">
          共 {subTasks.length} 个子任务，预估总工时 {totalEstimate} 分钟
        </Text>
      </div>
    </Modal>
  )
}

export default SubTaskSplitModal
