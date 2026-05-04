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
  Empty,
  Tabs,
  Tooltip,
  List,
  TextArea,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  NotificationOutlined,
  MessageOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface SystemMessage {
  id: string
  title: string
  content: string
  type: 'system' | 'announcement' | 'notification' | 'task'
  category: 'urgent' | 'important' | 'normal' | 'low'
  
  senderId: string
  senderName: string
  
  receiverType: 'all' | 'role' | 'department' | 'user'
  receiverIds: string[]
  receiverNames: string[]
  
  status: 'draft' | 'published' | 'cancelled'
  isRead: boolean
  isImportant: boolean
  
  publishTime: string | null
  createdAt: string
  updatedAt: string
  readAt: string | null
  expiryTime: string | null
  
  attachments: string[]
  redirectUrl: string | null
}

const mockMessages: SystemMessage[] = [
  {
    id: 'm001',
    title: '系统将于今晚进行维护升级',
    content: '各位同事：系统将于今晚22:00-24:00进行维护升级，届时系统将暂停服务，请提前做好相关准备。如有紧急事务，请联系技术支持。',
    type: 'system',
    category: 'urgent',
    senderId: 'u001',
    senderName: '超级管理员',
    receiverType: 'all',
    receiverIds: [],
    receiverNames: [],
    status: 'published',
    isRead: true,
    isImportant: true,
    publishTime: '2024-05-04T08:00:00Z',
    createdAt: '2024-05-04T07:30:00Z',
    updatedAt: '2024-05-04T08:00:00Z',
    readAt: '2024-05-04T09:15:00Z',
    expiryTime: '2024-05-05T23:59:59Z',
    attachments: ['维护通知.pdf'],
    redirectUrl: '/announcement/001',
  },
  {
    id: 'm002',
    title: '您有一个新的审批待处理',
    content: '张三提交的请假申请（2024-05-06至2024-05-10，共5天）需要您审批。请登录系统查看详情并及时处理。',
    type: 'notification',
    category: 'important',
    senderId: 'system',
    senderName: '系统',
    receiverType: 'user',
    receiverIds: ['u001'],
    receiverNames: ['超级管理员'],
    status: 'published',
    isRead: false,
    isImportant: false,
    publishTime: '2024-05-04T08:30:00Z',
    createdAt: '2024-05-04T08:30:00Z',
    updatedAt: '2024-05-04T08:30:00Z',
    readAt: null,
    expiryTime: '2024-05-10T23:59:59Z',
    attachments: [],
    redirectUrl: '/approval/ap001',
  },
  {
    id: 'm003',
    title: '新员工入职培训通知',
    content: '为帮助新员工更好地融入公司，将于下周一（5月6日）上午9:00在会议室A举行新员工入职培训。培训内容包括公司文化、规章制度、系统使用等。请新员工准时参加。',
    type: 'announcement',
    category: 'normal',
    senderId: 'u001',
    senderName: '超级管理员',
    receiverType: 'department',
    receiverIds: ['d001', 'd002'],
    receiverNames: ['总公司', '技术部'],
    status: 'published',
    isRead: false,
    isImportant: false,
    publishTime: '2024-05-03T10:00:00Z',
    createdAt: '2024-05-03T09:00:00Z',
    updatedAt: '2024-05-03T10:00:00Z',
    readAt: null,
    expiryTime: '2024-05-05T23:59:59Z',
    attachments: ['培训议程.docx'],
    redirectUrl: null,
  },
  {
    id: 'm004',
    title: '您的账号密码即将过期',
    content: '尊敬的用户，您的账号密码将在7天后过期。为了保障账号安全，建议您尽快修改密码。请登录系统后，在个人设置中进行密码修改操作。',
    type: 'system',
    category: 'low',
    senderId: 'system',
    senderName: '系统',
    receiverType: 'user',
    receiverIds: ['u001'],
    receiverNames: ['超级管理员'],
    status: 'published',
    isRead: false,
    isImportant: false,
    publishTime: '2024-05-01T08:00:00Z',
    createdAt: '2024-05-01T08:00:00Z',
    updatedAt: '2024-05-01T08:00:00Z',
    readAt: null,
    expiryTime: '2024-05-08T23:59:59Z',
    attachments: [],
    redirectUrl: '/settings/security',
  },
  {
    id: 'm005',
    title: '您的工单已被处理完成',
    content: '您提交的工单「用户无法登录系统」（工单ID：t001）已由超级管理员处理完成。处理结果：已修复登录问题，现在可以正常登录。如有其他问题，请继续反馈。',
    type: 'task',
    category: 'normal',
    senderId: 'system',
    senderName: '系统',
    receiverType: 'user',
    receiverIds: ['u002'],
    receiverNames: ['张三'],
    status: 'published',
    isRead: true,
    isImportant: false,
    publishTime: '2024-05-03T16:30:00Z',
    createdAt: '2024-05-03T16:30:00Z',
    updatedAt: '2024-05-03T16:30:00Z',
    readAt: '2024-05-04T08:45:00Z',
    expiryTime: '2024-06-03T23:59:59Z',
    attachments: [],
    redirectUrl: '/ticket/t001',
  },
]

const typeConfig = {
  system: { label: '系统消息', color: 'blue', icon: <BellOutlined /> },
  announcement: { label: '公告通知', color: 'green', icon: <NotificationOutlined /> },
  notification: { label: '待办提醒', color: 'orange', icon: <MailOutlined /> },
  task: { label: '任务通知', color: 'purple', icon: <MessageOutlined /> },
}

const categoryConfig = {
  urgent: { label: '紧急', color: 'red' },
  important: { label: '重要', color: 'orange' },
  normal: { label: '普通', color: 'default' },
  low: { label: '一般', color: 'default' },
}

const statusConfig = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'success' },
  cancelled: { label: '已取消', color: 'error' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [messages, setMessages] = useState<SystemMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SystemMessage | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState<string>('all')
  const [createVisible, setCreateVisible] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3009/api/messages`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setMessages(data.data || mockMessages)
        setPagination(prev => ({ ...prev, total: data.total || mockMessages.length }))
      } else {
        setMessages(mockMessages)
        setPagination(prev => ({ ...prev, total: mockMessages.length }))
      }
    } catch (error) {
      setMessages(mockMessages)
      setPagination(prev => ({ ...prev, total: mockMessages.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDetail = (record: SystemMessage) => {
    setSelectedItem(record)
    setDetailVisible(true)
    if (!record.isRead) {
      setMessages(prev => prev.map(m => 
        m.id === record.id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
      ))
    }
  }

  const handleCreate = () => {
    form.resetFields()
    setCreateVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const now = new Date().toISOString()
      const newItem: SystemMessage = {
        ...values,
        id: `m${Date.now().toString().slice(-3)}`,
        senderName: '当前用户',
        receiverIds: [],
        receiverNames: [],
        status: 'draft',
        isRead: false,
        isImportant: false,
        publishTime: null,
        createdAt: now,
        updatedAt: now,
        readAt: null,
        expiryTime: null,
        attachments: [],
        redirectUrl: null,
      }
      setMessages(prev => [newItem, ...prev])
      message.success('创建成功')
      setCreateVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const handleMarkAsRead = (record: SystemMessage) => {
    setMessages(prev => prev.map(m => 
      m.id === record.id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
    ))
    message.success('已标记为已读')
  }

  const handleMarkAsImportant = (record: SystemMessage) => {
    setMessages(prev => prev.map(m => 
      m.id === record.id ? { ...m, isImportant: !m.isImportant } : m
    ))
    message.success(record.isImportant ? '已取消标星' : '已标记为重要')
  }

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    message.success('删除成功')
  }

  const handleDeleteBatch = () => {
    message.success('批量删除成功')
  }

  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
    message.success('已全部标记为已读')
  }

  const getFilteredMessages = () => {
    switch (activeTab) {
      case 'unread':
        return messages.filter(m => !m.isRead)
      case 'important':
        return messages.filter(m => m.isImportant)
      case 'system':
        return messages.filter(m => m.type === 'system')
      case 'announcement':
        return messages.filter(m => m.type === 'announcement')
      case 'notification':
        return messages.filter(m => m.type === 'notification')
      case 'task':
        return messages.filter(m => m.type === 'task')
      default:
        return messages
    }
  }

  const columns: ColumnsType<SystemMessage> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (title: string, record: SystemMessage) => (
        <div style={{ fontWeight: record.isRead ? 'normal' : 600 }}>
          <Space>
            {!record.isRead && <Badge color="#1890ff" />}
            {record.isImportant && <span style={{ color: '#faad14' }}>★</span>}
            <span>{title}</span>
          </Space>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.system
        return (
          <Tag color={config.color}>
            {config.icon} {config.label}
          </Tag>
        )
      },
    },
    {
      title: '级别',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (category: string) => {
        const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.normal
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '发送人',
      dataIndex: 'senderName',
      key: 'senderName',
      width: 100,
      render: (name: string) => name || '系统',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (time: string | null) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      key: 'readStatus',
      width: 80,
      render: (_: any, record: SystemMessage) => (
        <Tag color={record.isRead ? 'default' : 'blue'}>
          {record.isRead ? '已读' : '未读'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: SystemMessage) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            查看
          </Button>
          {!record.isRead && (
            <Button type="link" size="small" onClick={() => handleMarkAsRead(record)}>
              标读
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleMarkAsImportant(record)}
            style={{ color: record.isImportant ? '#faad14' : undefined }}
          >
            {record.isImportant ? '取消标星' : '标星'}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const filteredMessages = getFilteredMessages()
  
  const totalCount = messages.length
  const unreadCount = messages.filter(m => !m.isRead).length
  const importantCount = messages.filter(m => m.isImportant).length

  const tabItems = [
    { key: 'all', label: `全部消息 (${totalCount})` },
    { key: 'unread', label: `未读消息 (${unreadCount})` },
    { key: 'important', label: `星标消息 (${importantCount})` },
    { key: 'system', label: '系统消息' },
    { key: 'announcement', label: '公告通知' },
    { key: 'notification', label: '待办提醒' },
    { key: 'task', label: '任务通知' },
  ]

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总消息数"
                    value={totalCount}
                    prefix={<BellOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="未读消息"
                    value={unreadCount}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<BellOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="星标消息"
                    value={importantCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<InfoCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="消息中心"
              bordered={false}
              extra={
                <Space>
                  <Button onClick={handleMarkAllRead}>
                    全部已读
                  </Button>
                  <Button icon={<PlusOutlined />} type="primary" onClick={handleCreate}>
                    新建消息
                  </Button>
                </Space>
              }
            >
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
              />

              <Spin spinning={loading}>
                {filteredMessages.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={filteredMessages}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={{
                      ...pagination,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                      onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
                    }}
                  />
                ) : (
                  <Empty description="暂无消息" style={{ padding: 40 }} />
                )}
              </Spin>
            </Card>

            <Modal
              title="消息详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              width={700}
              footer={[
                <Space key="actions">
                  {selectedItem && !selectedItem.isRead && (
                    <Button onClick={() => {
                      handleMarkAsRead(selectedItem)
                      setDetailVisible(false)
                    }}>
                      标记已读
                    </Button>
                  )}
                  {selectedItem && (
                    <Button
                      onClick={() => {
                        handleMarkAsImportant(selectedItem)
                      }}
                      style={{ color: selectedItem.isImportant ? '#faad14' : undefined }}
                    >
                      {selectedItem.isImportant ? '取消标星' : '标星'}
                    </Button>
                  )}
                  {selectedItem && selectedItem.redirectUrl && (
                    <Button type="primary">
                      跳转查看
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
                    <Descriptions.Item label="标题" span={2}>
                      <Space>
                        {!selectedItem.isRead && <Badge color="#1890ff" />}
                        {selectedItem.isImportant && <span style={{ color: '#faad14' }}>★</span>}
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{selectedItem.title}</span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="类型">
                      {(() => {
                        const config = typeConfig[selectedItem.type as keyof typeof typeConfig] || typeConfig.system
                        return (
                          <Tag color={config.color}>
                            {config.icon} {config.label}
                          </Tag>
                        )
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="级别">
                      {(() => {
                        const config = categoryConfig[selectedItem.category as keyof typeof categoryConfig] || categoryConfig.normal
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="发送人">{selectedItem.senderName}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={selectedItem.isRead ? 'default' : 'blue'}>
                        {selectedItem.isRead ? '已读' : '未读'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="发布时间">
                      {selectedItem.publishTime ? dayjs(selectedItem.publishTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </Descriptions.Item>
                    {selectedItem.readAt && (
                      <Descriptions.Item label="阅读时间">
                        {dayjs(selectedItem.readAt).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                    )}
                    {selectedItem.expiryTime && (
                      <Descriptions.Item label="过期时间">
                        {dayjs(selectedItem.expiryTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <Divider />
                  <Descriptions bordered column={1} title="消息内容">
                    <Descriptions.Item>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {selectedItem.content}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>

                  {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <h4 style={{ marginBottom: 12 }}>附件</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {selectedItem.attachments.map((att, idx) => (
                            <Tag key={idx} color="blue">{att}</Tag>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </Modal>

            <Modal
              title="新建消息"
              open={createVisible}
              onCancel={() => setCreateVisible(false)}
              onOk={handleSubmit}
              width={700}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'announcement', category: 'normal' }}
              >
                <Form.Item
                  name="title"
                  label="消息标题"
                  rules={[{ required: true, message: '请输入消息标题' }]}
                >
                  <Input placeholder="请输入消息标题" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="消息类型"
                      rules={[{ required: true, message: '请选择消息类型' }]}
                    >
                      <Select>
                        {Object.entries(typeConfig).map(([key, val]) => (
                          <Select.Option key={key} value={key}>{val.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="消息级别"
                    >
                      <Select>
                        {Object.entries(categoryConfig).map(([key, val]) => (
                          <Select.Option key={key} value={key}>{val.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="content"
                  label="消息内容"
                  rules={[{ required: true, message: '请输入消息内容' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="请输入消息内容..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
