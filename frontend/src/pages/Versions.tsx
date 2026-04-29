import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Tag, Space, Statistic, Row, Col, Modal, Form, Input, DatePicker, Select, Popconfirm, message, Typography, Progress, Empty, Badge, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CalendarOutlined, TeamOutlined, TagOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import { useIssueStore } from '@/stores/issueStore'
import { useUIStore } from '@/stores/uiStore'
import type { Version } from '@/types'
import { formatDate } from '@/utils'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const Versions: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { versions, fetchVersions, createVersion, updateVersion, deleteVersion, releaseVersion } = useProjectMetaStore()
  const { issues, fetchIssues } = useIssueStore()
  const { openModal } = useUIStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVersion, setEditingVersion] = useState<Version | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (projectId) {
      fetchVersions(projectId)
      fetchIssues(projectId)
    }
  }, [projectId, fetchVersions, fetchIssues])

  const getVersionIssues = (versionId: string) => {
    return issues.filter(i => i.versionIds?.includes(versionId) || i.fixVersionIds?.includes(versionId))
  }

  const getVersionProgress = (versionId: string) => {
    const versionIssues = getVersionIssues(versionId)
    if (versionIssues.length === 0) return 0
    const completed = versionIssues.filter(i => ['done', 'closed'].includes(i.status)).length
    return Math.round((completed / versionIssues.length) * 100)
  }

  const handleCreate = () => {
    setEditingVersion(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (version: Version) => {
    setEditingVersion(version)
    form.setFieldsValue({
      name: version.name,
      description: version.description,
      startDate: version.startDate ? dayjs(version.startDate) : undefined,
      releaseDate: version.releaseDate ? dayjs(version.releaseDate) : undefined,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (values: {
    name: string
    description?: string
    startDate?: dayjs.Dayjs
    releaseDate?: dayjs.Dayjs
  }) => {
    if (editingVersion) {
      const success = await updateVersion(editingVersion.id, {
        name: values.name,
        description: values.description,
        startDate: values.startDate?.toDate(),
        releaseDate: values.releaseDate?.toDate(),
      })
      if (success) {
        message.success('版本更新成功')
      }
    } else {
      const version = await createVersion({
        name: values.name,
        description: values.description,
        startDate: values.startDate?.toDate(),
        releaseDate: values.releaseDate?.toDate(),
      })
      if (version) {
        message.success('版本创建成功')
      }
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteVersion(id)
    if (success) {
      message.success('版本删除成功')
    }
  }

  const handleRelease = async (id: string) => {
    Modal.confirm({
      title: '发布版本',
      content: '确定要发布这个版本吗？发布后版本状态将变为已发布。',
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        const success = await releaseVersion(id)
        if (success) {
          message.success('版本已发布')
        }
      },
    })
  }

  const statusColors: Record<string, string> = {
    unreleased: 'default',
    released: 'success',
    archived: 'default',
  }

  const statusLabels: Record<string, string> = {
    unreleased: '未发布',
    released: '已发布',
    archived: '已归档',
  }

  const columns = [
    {
      title: '版本名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Version) => (
      <Space>
        {record.status === 'released' && (
        <Badge status="success" text="已发布" />
      )}
        <span style={{ fontWeight: record.status === 'released' ? 600 : 400 }}>
          {text}
        </span>
      </Space>
    ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc?: string) => desc || <Text type="secondary">暂无描述</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: Version['status']) => (
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
      title: '发布日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date?: Date) => date ? formatDate(date) : '-',
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: unknown, record: Version) => {
        const issues = getVersionIssues(record.id)
        const progress = getVersionProgress(record.id)
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
      render: (_: unknown, record: Version) => (
      <Space size="small">
        {record.status === 'unreleased' && (
        <>
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleRelease(record.id)}
          >
            发布
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
            title="确定删除此版本吗？"
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
        {record.status === 'released' && (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      )}
      </Space>
    ),
    },
  ]

  const unreleasedVersions = versions.filter(v => v.status === 'unreleased')
  const releasedVersions = versions.filter(v => v.status === 'released')

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>版本管理</Title>
          <Text type="secondary">规划和管理项目版本发布</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          新建版本
        </Button>
      </div>

      {versions.length > 0 && (
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总版本数"
              value={versions.length}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="待发布"
              value={unreleasedVersions.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已发布"
              value={releasedVersions.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    )}

      <Card>
        <Table
          columns={columns}
          dataSource={versions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个版本`,
          }}
          locale={{
            emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无版本"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                创建第一个版本
              </Button>
            </Empty>
          ),
          }}
        />
      </Card>

      <Modal
        title={editingVersion ? '编辑版本' : '新建版本'}
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
            label="版本名称"
            rules={[{ required: true, message: '请输入版本名称' }]}
          >
            <Input placeholder="例如：v1.0.0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="版本描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="描述这个版本的内容..."
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="开始日期"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择开始日期"
            />
          </Form.Item>

          <Form.Item
            name="releaseDate"
            label="计划发布日期"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择计划发布日期"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Versions
