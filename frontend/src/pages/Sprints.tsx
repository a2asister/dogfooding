import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Tag, Space, Statistic, Row, Col, Modal, Form, Input, DatePicker, Select, Popconfirm, message, Typography, Progress, Empty, Badge, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, CheckCircleOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined, RocketOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useIssueStore } from '@/stores/issueStore'
import { useUIStore } from '@/stores/uiStore'
import type { Sprint } from '@/types'
import { formatDate, addDays } from '@/utils'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const Sprints: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { sprints, currentSprint, fetchSprints, createSprint, updateSprint, deleteSprint, startSprint, completeSprint, fetchSprintStats, sprintStats } = useProjectMetaStore()
  const { issues, fetchIssues } = useIssueStore()
  const { openModal } = useUIStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId)
      fetchIssues(projectId)
    }
  }, [projectId, fetchSprints, fetchIssues])

  const getSprintIssues = (sprintId: string) => {
    return issues.filter(i => i.sprintId === sprintId)
  }

  const getSprintProgress = (sprintId: string) => {
    const sprintIssues = getSprintIssues(sprintId)
    if (sprintIssues.length === 0) return 0
    const completed = sprintIssues.filter(i => ['done', 'closed'].includes(i.status)).length
    return Math.round((completed / sprintIssues.length) * 100)
  }

  const handleCreate = () => {
    setEditingSprint(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (sprint: Sprint) => {
    setEditingSprint(sprint)
    form.setFieldsValue({
      name: sprint.name,
      goal: sprint.goal,
      dateRange: sprint.startDate && sprint.endDate ? [dayjs(sprint.startDate), dayjs(sprint.endDate)] : undefined,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (values: {
    name: string
    goal?: string
    dateRange?: [dayjs.Dayjs | null, dayjs.Dayjs | null]
  }) => {
    if (editingSprint) {
      const success = await updateSprint(editingSprint.id, {
        name: values.name,
        goal: values.goal,
        startDate: values.dateRange?.[0]?.toDate(),
        endDate: values.dateRange?.[1]?.toDate(),
      })
      if (success) {
        message.success('迭代更新成功')
      }
    } else {
      const sprint = await createSprint({
        name: values.name,
        goal: values.goal,
        startDate: values.dateRange?.[0]?.toDate(),
        endDate: values.dateRange?.[1]?.toDate(),
      })
      if (sprint) {
        message.success('迭代创建成功')
      }
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteSprint(id)
    if (success) {
      message.success('迭代删除成功')
    }
  }

  const handleStart = async (id: string) => {
    const success = await startSprint(id)
    if (success) {
      message.success('迭代已启动')
    }
  }

  const handleComplete = async (id: string) => {
    Modal.confirm({
      title: '完成迭代',
      content: '确定要完成这个迭代吗？未完成的事项将会移到下一个迭代或待办事项。',
      okText: '确认完成',
      cancelText: '取消',
      onOk: async () => {
        const success = await completeSprint(id)
        if (success) {
          message.success('迭代已完成')
        }
      },
    })
  }

  const statusColors: Record<string, string> = {
    future: 'default',
    active: 'processing',
    completed: 'success',
    closed: 'default',
  }

  const statusLabels: Record<string, string> = {
    future: '待规划',
    active: '进行中',
    completed: '已完成',
    closed: '已关闭',
  }

  const columns = [
    {
      title: '迭代名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Sprint) => (
      <Space>
        {record.status === 'active' && (
        <Badge status="processing" text="当前迭代" />
      )}
        <span style={{ fontWeight: record.status === 'active' ? 600 : 400 }}>
          {text}
        </span>
      </Space>
    ),
    },
    {
      title: '目标',
      dataIndex: 'goal',
      key: 'goal',
      render: (goal?: string) => goal || <Text type="secondary">暂无目标</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Sprint['status']) => (
      <Tag color={statusColors[status]}>
        {statusLabels[status]}
      </Tag>
    ),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date?: Date) => date ? formatDate(date) : '-',
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date?: Date) => date ? formatDate(date) : '-',
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: unknown, record: Sprint) => {
        const issues = getSprintIssues(record.id)
        const progress = getSprintProgress(record.id)
        return (
        <div style={{ width: 150 }}>
          <Progress 
            percent={progress} 
            size="small" 
            format={() => `${issues.length} 个事项`}
          />
        </div>
      )
    },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Sprint) => (
      <Space size="small">
        {record.status === 'future' && (
        <>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStart(record.id)}
          >
            启动
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此迭代吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      )}
        {record.status === 'active' && (
        <>
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleComplete(record.id)}
          >
            完成
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </>
      )}
        {record.status === 'completed' && (
        <Button
          type="link"
          size="small"
          onClick={() => fetchSprintStats(record.id)}
        >
          查看报告
        </Button>
      )}
      </Space>
    ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>迭代管理</Title>
          <Text type="secondary">规划和管理项目迭代</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          新建迭代
        </Button>
      </div>

      {currentSprint && (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Statistic
              title="当前迭代"
              value={currentSprint.name}
              prefix={<RocketOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ fontSize: 18, color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="开始日期"
              value={currentSprint.startDate ? formatDate(currentSprint.startDate) : '-'}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="结束日期"
              value={currentSprint.endDate ? formatDate(currentSprint.endDate) : '-'}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="事项数"
              value={getSprintIssues(currentSprint.id).length}
              prefix={<TeamOutlined />}
              suffix={<Tag color="green">
                进度: {getSprintProgress(currentSprint.id)}%
              </Tag>}
            />
          </Col>
        </Row>
      </Card>
    )}

      <Card>
        <Table
          columns={columns}
          dataSource={sprints}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个迭代`,
          }}
          locale={{
            emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无迭代"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                创建第一个迭代
              </Button>
            </Empty>
          ),
          }}
        />
      </Card>

      <Modal
        title={editingSprint ? '编辑迭代' : '新建迭代'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="迭代名称"
            rules={[{ required: true, message: '请输入迭代名称' }]}
          >
            <Input placeholder="例如：Sprint 1" />
          </Form.Item>

          <Form.Item
            name="goal"
            label="迭代目标"
          >
            <Input.TextArea
              rows={3}
              placeholder="描述这个迭代的目标..."
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="时间范围"
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Sprints
