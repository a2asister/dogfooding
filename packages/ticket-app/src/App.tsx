import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Radio,
  DatePicker,
  Badge,
  Timeline,
  Empty,
  InputNumber,
  TextArea,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Ticket {
  id: string
  title: string
  description: string
  type: 'bug' | 'feature' | 'support' | 'other'
  priority: 'urgent' | 'high' | 'medium' | 'low'

  creatorId: string
  creatorName: string
  assigneeId: string | null
  assigneeName: string | null

 status: 'open' | 'processing' | 'pending' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null

  deadline: string | null
  tags: string[]
  priority: 'high' | 'medium' | 'low'
}

const mockTickets: Ticket[] = [
  { id: 't001', title: '用户无法登录系统', description: '用户张三反馈使用正确的账号密码无法登录系统，多次尝试均失败', type: 'bug', creator: '张三', creatorId: 'u002', creatorName: '张三', assigneeId: 'u001', assigneeName: '超级管理员', status: 'open', createdAt: '2024-05-03T09:00:00Z', updatedAt: '2024-05-03T09:00:00Z', resolvedAt: null, closedAt: null, deadline: '2024-05-05T23:59:59Z', tags: ['登录', '紧急'], priority: 'high' },
  { id: 't002', title: '新增用户导出功能', description: '希望能够支持导出用户列表为Excel格式，便于数据备份', type: 'feature', creator: '李四', creatorId: 'u003', creatorName: '李四', assigneeId: 'u001', assigneeName: '超级管理员', status: 'processing', createdAt: '2024-05-02T14:30:00Z', updatedAt: '2024-05-03T10:00:00Z', resolvedAt: null, closedAt: null, deadline: '2024-05-10T23:59:59Z', tags: ['导出', '功能需求'], priority: 'medium' },
  { id: 't003', title: '权限分配问题', description: '分配权限后，用户需要重新登录才能生效，是否可以实时生效？', type: 'question', creator: '王五', creatorId: 'u004', creatorName: '王五', assigneeId: null, assigneeName: null, status: 'open', createdAt: '2024-05-01T16:00:00Z', updatedAt: '2024-05-01T16:00:00Z', resolvedAt: null, closedAt: null, deadline: null, tags: ['权限'], priority: 'low' },
]

const typeConfig = {
  bug: { label: 'Bug', color: 'red' },
  feature: { label: '功能需求', color: 'blue' },
  support: { label: '技术支持', color: 'orange' },
  other: { label: '其他', color: 'default' },
}

const statusConfig = {
  open: { label: '待处理', color: 'blue' },
  processing: { label: '处理中', color: 'processing' },
  pending: { label: '待确认', color: 'orange' },
  resolved: { label: '已解决', color: 'success' },
  closed: { label: '已关闭', color: 'default' },
}

const priorityConfig = {
  high: { label: '高', color: 'red' },
  medium: { label: '中', color: 'orange' },
  low: { label: '低', color: 'green' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Ticket | null>(null)
  const [selectedItem, setSelectedItem] = useState<Ticket | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3007/api/tickets`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setTickets(data.data || mockTickets)
        setPagination(prev => ({ ...prev, total: data.total || mockTickets.length }))
      } else {
        setTickets(mockTickets)
        setPagination(prev => ({ ...prev, total: mockTickets.length }))
      }
    } catch (error) {
      setTickets(mockTickets)
      setPagination(prev => ({ ...prev, total: mockTickets.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Ticket) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id))
    message.success('删除成功')
  }

  const handleDetail = (record: Ticket) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        setTickets(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...values, updatedAt: new Date().toISOString() } : t))
        message.success('更新成功')
      } else {
        const newItem: Ticket = {
          ...values,
          id: `t${Date.now().toString().slice(-3)}`,
          creatorName: '当前用户',
          assigneeName: null,
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolvedAt: null,
          closedAt: null,
        }
        setTickets(prev => [newItem, ...prev])
        message.success('创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const handleStatusChange = (ticket: Ticket, newStatus: string) => {
    const now = new Date().toISOString()
    const updates: Partial<Ticket> = {
      status: newStatus as any,
      updatedAt: now,
    }
    if (newStatus === 'resolved') {
      updates.resolvedAt = now
    }
    if (newStatus === 'closed') {
      updates.closedAt = now
    }
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...updates } : t))
    message.success('状态更新成功')
  }

  const isOverdue = (deadline: string | null) => {
    if (!deadline) return false
    return dayjs(deadline).isBefore(dayjs())
  }

  const columns: ColumnsType<Ticket> = [
    {
      title: '工单标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title: string, record: Ticket) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.id}
            {record.tags && record.tags.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                {record.tags.slice(0, 2).map(tag => (
                  <Tag key={tag} color="default" style={{ marginLeft: 4, fontSize: 11 }}>{tag}</Tag>
                ))}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => {
        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Ticket) => {
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open
        const overdue = isOverdue(record.deadline)
        return (
          <Space>
            <Tag color={config.color}>{config.label}</Tag>
            {overdue && status !== 'resolved' && status !== 'closed' && (
              <Badge dot color="red" />
            )}
          </Space>
        )
      },
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 100,
    },
    {
      title: '负责人',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
      width: 100,
      render: (name: string | null) => name || <Tag color="default">未分配</Tag>,
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 170,
      render: (deadline: string | null, record: Ticket) => {
        if (!deadline) return <span style={{ color: '#999' }}>无</span>
        const overdue = isOverdue(deadline)
        return (
          <span style={{ color: overdue ? '#ff4d4f' : 'inherit' }}>
            {dayjs(deadline).format('YYYY-MM-DD HH:mm')}
            {overdue && ' (已逾期)'}
          </span>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Ticket) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    message.info('正在搜索...')
  }

  const handleReset = () => {
    form.resetFields()
  }

  const totalCount = tickets.length
  const openCount = tickets.filter(t => t.status === 'open').length
  const processingCount = tickets.filter(t => t.status === 'processing').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="总工单"
                    value={totalCount}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="待处理"
                    value={openCount}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="处理中"
                    value={processingCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<MinusCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="已解决"
                    value={resolvedCount}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="工单列表"
              bordered={false}
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                    刷新
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新建工单
                  </Button>
                </Space>
              }
            >
              <Form
                form={form}
                layout="inline"
                style={{ marginBottom: 16 }}
              >
                <Form.Item label="关键词">
                  <Input placeholder="工单标题/描述" prefix={<SearchOutlined />} style={{ width: 180 }} />
                </Form.Item>
                <Form.Item label="类型">
                  <Select placeholder="全部类型" allowClear style={{ width: 100 }}>
                    {Object.entries(typeConfig).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 100 }}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="优先级">
                  <Select placeholder="全部优先级" allowClear style={{ width: 100 }}>
                    {Object.entries(priorityConfig).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleSearch}>搜索</Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Form.Item>
              </Form>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={tickets}
                  rowKey="id"
                  scroll={{ x: 1400 }}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
                  }}
                />
              </Spin>
            </Card>

            <Modal
              title={editingItem ? '编辑工单' : '新建工单'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={700}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'bug', priority: 'medium', status: 'open' }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="title"
                      label="工单标题"
                      rules={[{ required: true, message: '请输入工单标题' }]}
                    >
                      <Input placeholder="请输入工单标题" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="type"
                      label="类型"
                    >
                      <Select>
                        {Object.entries(typeConfig).map(([key, val]) => (
                          <Select.Option key={key} value={key}>{val.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="priority"
                      label="优先级"
                    >
                      <Select>
                        {Object.entries(priorityConfig).map(([key, val]) => (
                          <Select.Option key={key} value={key}>{val.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="status"
                      label="状态"
                    >
                      <Select>
                        {Object.entries(statusConfig).map(([key, val]) => (
                          <Select.Option key={key} value={key}>{val.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="assigneeName"
                      label="负责人"
                    >
                      <Select placeholder="选择负责人" allowClear>
                        <Select.Option value="超级管理员">超级管理员</Select.Option>
                        <Select.Option value="张三">张三</Select.Option>
                        <Select.Option value="李四">李四</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="deadline"
                      label="截止时间"
                    >
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="选择截止时间"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="description"
                  label="描述"
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="请输入详细描述"
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="工单详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              width={800}
              footer={[
                <Space key="actions">
                  {selectedItem && selectedItem.status === 'open' && (
                    <Button onClick={() => handleStatusChange(selectedItem, 'processing')}>
                      开始处理
                    </Button>
                  )}
                  {selectedItem && selectedItem.status === 'processing' && (
                    <Button type="primary" onClick={() => handleStatusChange(selectedItem, 'resolved')}>
                      标记解决
                    </Button>
                  )}
                  {selectedItem && selectedItem.status === 'resolved' && (
                    <Button onClick={() => handleStatusChange(selectedItem, 'closed')}>
                      关闭工单
                    </Button>
                  )}
                  <Button onClick={() => setDetailVisible(false)}>
                    关闭
                  </Button>
                </Space>,
              ]}
            >
              {selectedItem && (
                <>
                  <Descriptions bordered column={2} title="基本信息">
                    <Descriptions.Item label="工单ID">{selectedItem.id}</Descriptions.Item>
                    <Descriptions.Item label="标题">{selectedItem.title}</Descriptions.Item>
                    <Descriptions.Item label="类型">
                      {(() => {
                        const config = typeConfig[selectedItem.type as keyof typeof typeConfig] || typeConfig.other
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="优先级">
                      {(() => {
                        const config = priorityConfig[selectedItem.priority as keyof typeof priorityConfig] || priorityConfig.medium
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {(() => {
                        const config = statusConfig[selectedItem.status as keyof typeof statusConfig] || statusConfig.open
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="截止时间">
                      {selectedItem.deadline ? dayjs(selectedItem.deadline).format('YYYY-MM-DD HH:mm') : '无'}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建人">{selectedItem.creatorName}</Descriptions.Item>
                    <Descriptions.Item label="负责人">{selectedItem.assigneeName || '未分配'}</Descriptions.Item>
                    <Descriptions.Item label="创建时间" span={2}>
                      {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>

                  {selectedItem.description && (
                    <>
                      <Divider />
                      <Descriptions bordered column={1} title="描述">
                        <Descriptions.Item>{selectedItem.description}</Descriptions.Item>
                      </Descriptions>
                    </>
                  )}

                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <h4 style={{ marginBottom: 12 }}>标签</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {selectedItem.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </Modal>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
