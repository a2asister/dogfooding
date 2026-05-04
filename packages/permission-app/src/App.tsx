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
  TreeSelect,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Permission {
  id: string
  name: string
  code: string
  type: 'menu' | 'button'
  parentId: string | null
  description: string
  path: string | null
  icon: string | null
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

const mockPermissions: Permission[] = [
  { id: 'p001', name: '查看用户', code: 'user:view', type: 'button', parentId: null, description: '查看用户列表和详情', path: '/user', icon: 'UserOutlined', sort: 1, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p002', name: '新增用户', code: 'user:create', type: 'button', parentId: 'p001', description: '创建新用户', path: null, icon: null, sort: 2, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p003', name: '编辑用户', code: 'user:edit', type: 'button', parentId: 'p001', description: '编辑用户信息', path: null, icon: null, sort: 3, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p004', name: '删除用户', code: 'user:delete', type: 'button', parentId: 'p001', description: '删除用户', path: null, icon: null, sort: 4, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p005', name: '角色管理', code: 'role:manage', type: 'menu', parentId: null, description: '角色管理菜单', path: '/role', icon: 'SafetyOutlined', sort: 5, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'p006', name: '权限管理', code: 'permission:manage', type: 'menu', parentId: null, description: '权限管理菜单', path: '/permission', icon: 'KeyOutlined', sort: 6, status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

const treeData = [
  {
    title: '用户管理',
    value: 'p001',
    children: [
      { title: '新增用户', value: 'p002' },
      { title: '编辑用户', value: 'p003' },
      { title: '删除用户', value: 'p004' },
    ],
  },
  { title: '角色管理', value: 'p005' },
  { title: '权限管理', value: 'p006' },
]

const App: React.FC<{ routerBase?: string }> = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Permission | null>(null)
  const [selectedItem, setSelectedItem] = useState<Permission | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3002/api/permissions`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setPermissions(data.data || mockPermissions)
        setPagination(prev => ({ ...prev, total: data.total || mockPermissions.length }))
      } else {
        setPermissions(mockPermissions)
        setPagination(prev => ({ ...prev, total: mockPermissions.length }))
      }
    } catch (error) {
      setPermissions(mockPermissions)
      setPagination(prev => ({ ...prev, total: mockPermissions.length }))
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

  const handleEdit = (record: Permission) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setPermissions(prev => prev.filter(p => p.id !== id))
    message.success('删除成功')
  }

  const handleDetail = (record: Permission) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        setPermissions(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...values } : p))
        message.success('更新成功')
      } else {
        const newItem: Permission = {
          ...values,
          id: `p${Date.now().toString().slice(-3)}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setPermissions(prev => [newItem, ...prev])
        message.success('创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const columns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '权限编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'menu' ? 'blue' : 'green'}>
          {type === 'menu' ? '菜单' : '按钮'}
        </Tag>
      ),
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 120,
      render: (path: string | null) => path || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 60,
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
      render: (_: any, record: Permission) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
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
                    title="总权限数"
                    value={permissions.length}
                    prefix={<KeyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="菜单权限"
                    value={permissions.filter(p => p.type === 'menu').length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="按钮权限"
                    value={permissions.filter(p => p.type === 'button').length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="权限列表"
              bordered={false}
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                    刷新
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增权限
                  </Button>
                </Space>
              }
            >
              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={permissions}
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
              title={editingItem ? '编辑权限' : '新增权限'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={600}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'button', status: 'active', sort: 0 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="权限名称"
                      rules={[{ required: true, message: '请输入权限名称' }]}
                    >
                      <Input placeholder="请输入权限名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label="权限编码"
                      rules={[{ required: true, message: '请输入权限编码' }]}
                    >
                      <Input placeholder="如: user:create" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="权限类型"
                      rules={[{ required: true, message: '请选择权限类型' }]}
                    >
                      <Radio.Group>
                        <Radio value="menu">菜单</Radio>
                        <Radio value="button">按钮</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="parentId"
                      label="上级权限"
                    >
                      <TreeSelect
                        placeholder="请选择上级权限（可选）"
                        treeData={treeData}
                        allowClear
                        treeDefaultExpandAll
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="path"
                      label="路由路径"
                    >
                      <Input placeholder="如: /user/list" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="icon"
                      label="图标"
                    >
                      <Input placeholder="如: UserOutlined" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="sort"
                      label="排序"
                    >
                      <InputNumber style={{ width: '100%' }} placeholder="数字越小越靠前" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="状态"
                    >
                      <Radio.Group>
                        <Radio value="active">启用</Radio>
                        <Radio value="inactive">禁用</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="description"
                  label="描述"
                >
                  <Input.TextArea rows={3} placeholder="请输入权限描述" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="权限详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>,
              ]}
              width={600}
            >
              {selectedItem && (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="权限名称">{selectedItem.name}</Descriptions.Item>
                  <Descriptions.Item label="权限编码">{selectedItem.code}</Descriptions.Item>
                  <Descriptions.Item label="类型">
                    <Tag color={selectedItem.type === 'menu' ? 'blue' : 'green'}>
                      {selectedItem.type === 'menu' ? '菜单' : '按钮'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="上级权限">
                    {selectedItem.parentId || '无'}
                  </Descriptions.Item>
                  <Descriptions.Item label="路由路径">{selectedItem.path || '-'}</Descriptions.Item>
                  <Descriptions.Item label="图标">{selectedItem.icon || '-'}</Descriptions.Item>
                  <Descriptions.Item label="排序">{selectedItem.sort}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={selectedItem.status === 'active' ? 'green' : 'red'}>
                      {selectedItem.status === 'active' ? '启用' : '禁用'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="描述" span={2}>
                    {selectedItem.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    {dayjs(selectedItem.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                </Descriptions>
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
