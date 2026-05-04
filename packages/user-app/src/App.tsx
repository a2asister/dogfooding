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
  Avatar,
  Popconfirm,
  Card,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  InputNumber,
  Radio,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface User {
  id: string
  username: string
  password?: string
  realName: string
  email: string
  phone: string
  avatar: string
  departmentId: string
  roleIds: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

const mockUsers: User[] = [
  {
    id: 'u001',
    username: 'admin',
    realName: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    departmentId: 'd001',
    roleIds: ['r001'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u002',
    username: 'zhangsan',
    realName: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    departmentId: 'd002',
    roleIds: ['r002'],
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'u003',
    username: 'lisi',
    realName: '李四',
    email: 'lisi@example.com',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    departmentId: 'd003',
    roleIds: ['r003'],
    status: 'active',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'u004',
    username: 'wangwu',
    realName: '王五',
    email: 'wangwu@example.com',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    departmentId: 'd002',
    roleIds: ['r002'],
    status: 'inactive',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
]

const mockDepartments = [
  { value: 'd001', label: '总公司' },
  { value: 'd002', label: '技术部' },
  { value: 'd003', label: '市场部' },
]

const mockRoles = [
  { value: 'r001', label: '超级管理员' },
  { value: 'r002', label: '部门管理员' },
  { value: 'r003', label: '普通员工' },
]

const App: React.FC<{ routerBase?: string }> = ({ routerBase = '/user' }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchUsers = async (params?: any) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/users`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.data || mockUsers)
        setPagination(prev => ({ ...prev, total: data.total || mockUsers.length }))
      } else {
        setUsers(mockUsers)
        setPagination(prev => ({ ...prev, total: mockUsers.length }))
      }
    } catch (error) {
      setUsers(mockUsers)
      setPagination(prev => ({ ...prev, total: mockUsers.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue({
      ...record,
    })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    message.success('删除成功')
  }

  const handleDetail = (record: User) => {
    setSelectedUser(record)
    setDetailVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...values } : u))
        message.success('更新成功')
      } else {
        const newUser: User = {
          ...values,
          id: `u${Date.now().toString().slice(-3)}`,
          avatar: values.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setUsers(prev => [newUser, ...prev])
        message.success('创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: User) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="user-app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="总用户数"
                    value={users.length}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="活跃用户"
                    value={users.filter(u => u.status === 'active').length}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="禁用用户"
                    value={users.filter(u => u.status === 'inactive').length}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="今日新增"
                    value={12}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="用户列表"
              bordered={false}
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchUsers()}>
                    刷新
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增用户
                  </Button>
                </Space>
              }
            >
              <Form
                form={searchForm}
                layout="inline"
                style={{ marginBottom: 16 }}
              >
                <Form.Item name="keyword" label="关键词">
                  <Input placeholder="用户名/姓名/邮箱" prefix={<SearchOutlined />} style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="status" label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 120 }}>
                    <Select.Option value="active">启用</Select.Option>
                    <Select.Option value="inactive">禁用</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">搜索</Button>
                    <Button onClick={() => searchForm.resetFields()}>重置</Button>
                  </Space>
                </Form.Item>
              </Form>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={users}
                  rowKey="id"
                  scroll={{ x: 1200 }}
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
              title={editingUser ? '编辑用户' : '新增用户'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={720}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label="用户名"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input placeholder="请输入用户名" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="realName"
                      label="真实姓名"
                      rules={[{ required: true, message: '请输入真实姓名' }]}
                    >
                      <Input placeholder="请输入真实姓名" />
                    </Form.Item>
                  </Col>
                </Row>
                {!editingUser && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                      >
                        <Input.Password placeholder="请输入密码" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['password']}
                        rules={[
                          { required: true, message: '请确认密码' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve()
                              }
                              return Promise.reject(new Error('两次密码不一致'))
                            },
                          }),
                        ]}
                      >
                        <Input.Password placeholder="请确认密码" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱格式不正确' },
                      ]}
                    >
                      <Input placeholder="请输入邮箱" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="手机号"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                      ]}
                    >
                      <Input placeholder="请输入手机号" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="departmentId"
                      label="部门"
                      rules={[{ required: true, message: '请选择部门' }]}
                    >
                      <Select placeholder="请选择部门" options={mockDepartments} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="roleIds"
                      label="角色"
                      rules={[{ required: true, message: '请选择角色' }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择角色"
                        options={mockRoles}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="status" label="状态">
                      <Radio.Group>
                        <Radio value="active">启用</Radio>
                        <Radio value="inactive">禁用</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>

            <Modal
              title="用户详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>,
              ]}
              width={720}
            >
              {selectedUser && (
                <>
                  <Descriptions
                    title="基本信息"
                    bordered
                    column={2}
                  >
                    <Descriptions.Item label="头像">
                      <Avatar src={selectedUser.avatar} size={64} icon={<UserOutlined />} />
                    </Descriptions.Item>
                    <Descriptions.Item label="用户名">
                      {selectedUser.username}
                    </Descriptions.Item>
                    <Descriptions.Item label="真实姓名">
                      {selectedUser.realName}
                    </Descriptions.Item>
                    <Descriptions.Item label="邮箱">
                      {selectedUser.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="手机号">
                      {selectedUser.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={selectedUser.status === 'active' ? 'green' : 'red'}>
                        {selectedUser.status === 'active' ? '启用' : '禁用'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="所属部门">
                      {mockDepartments.find(d => d.value === selectedUser.departmentId)?.label || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="角色">
                      {selectedUser.roleIds.map(rid => (
                        <Tag key={rid} style={{ marginBottom: 4 }}>
                          {mockRoles.find(r => r.value === rid)?.label}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider />
                  <Descriptions
                    title="时间信息"
                    bordered
                    column={2}
                  >
                    <Descriptions.Item label="创建时间">
                      {dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="更新时间">
                      {dayjs(selectedUser.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>
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
