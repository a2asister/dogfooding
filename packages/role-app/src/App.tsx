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
  Transfer,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissionIds: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

const mockRoles: Role[] = [
  { id: 'r001', name: '超级管理员', code: 'super_admin', description: '拥有系统所有权限', permissionIds: ['p001', 'p002', 'p003', 'p004', 'p005'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'r002', name: '部门管理员', code: 'dept_admin', description: '管理本部门用户和基础权限', permissionIds: ['p001', 'p002', 'p003'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'r003', name: '普通员工', code: 'employee', description: '基础查看权限', permissionIds: ['p001'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
]

const mockPermissions = [
  { key: 'p001', title: '查看用户', description: 'user:view' },
  { key: 'p002', title: '新增用户', description: 'user:create' },
  { key: 'p003', title: '编辑用户', description: 'user:edit' },
  { key: 'p004', title: '删除用户', description: 'user:delete' },
  { key: 'p005', title: '角色管理', description: 'role:manage' },
  { key: 'p006', title: '权限管理', description: 'permission:manage' },
  { key: 'p007', title: '部门管理', description: 'department:manage' },
  { key: 'p008', title: '日志查看', description: 'log:view' },
  { key: 'p009', title: '审计管理', description: 'audit:manage' },
  { key: 'p010', title: '系统设置', description: 'setting:manage' },
]

const App: React.FC<{ routerBase?: string }> = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [permissionVisible, setPermissionVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Role | null>(null)
  const [selectedItem, setSelectedItem] = useState<Role | null>(null)
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3003/api/roles`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setRoles(data.data || mockRoles)
        setPagination(prev => ({ ...prev, total: data.total || mockRoles.length }))
      } else {
        setRoles(mockRoles)
        setPagination(prev => ({ ...prev, total: mockRoles.length }))
      }
    } catch (error) {
      setRoles(mockRoles)
      setPagination(prev => ({ ...prev, total: mockRoles.length }))
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

  const handleEdit = (record: Role) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    if (id === 'r001') {
      message.warning('超级管理员角色不可删除')
      return
    }
    setRoles(prev => prev.filter(r => r.id !== id))
    message.success('删除成功')
  }

  const handleDetail = (record: Role) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const handlePermission = (record: Role) => {
    setSelectedItem(record)
    setTargetKeys(record.permissionIds || [])
    setPermissionVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        setRoles(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...values } : r))
        message.success('更新成功')
      } else {
        const newItem: Role = {
          ...values,
          id: `r${Date.now().toString().slice(-3)}`,
          permissionIds: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setRoles(prev => [newItem, ...prev])
        message.success('创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      message.error('提交失败，请检查表单')
    }
  }

  const handlePermissionSubmit = () => {
    if (selectedItem) {
      setRoles(prev => prev.map(r => 
        r.id === selectedItem.id 
          ? { ...r, permissionIds: targetKeys, updatedAt: new Date().toISOString() } 
          : r
      ))
      message.success('权限分配成功')
      setPermissionVisible(false)
    }
  }

  const getPermissionNames = (ids: string[]) => {
    return ids
      .map(id => mockPermissions.find(p => p.key === id)?.title)
      .filter(Boolean)
      .slice(0, 5)
      .join('、') + (ids.length > 5 ? ` 等${ids.length}个权限` : '')
  }

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      width: 100,
      render: (_: any, record: Role) => (
        <Tag color="blue">{record.permissionIds?.length || 0} 个权限</Tag>
      ),
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
      width: 240,
      fixed: 'right',
      render: (_: any, record: Role) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handlePermission(record)}>
            权限分配
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

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="总角色数"
                    value={roles.length}
                    prefix={<SafetyOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="启用角色"
                    value={roles.filter(r => r.status === 'active').length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="禁用角色"
                    value={roles.filter(r => r.status === 'inactive').length}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="角色列表"
              bordered={false}
              extra={
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                    刷新
                  </Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增角色
                  </Button>
                </Space>
              }
            >
              <Form
                layout="inline"
                style={{ marginBottom: 16 }}
              >
                <Form.Item label="关键词">
                  <Input placeholder="角色名称/编码" prefix={<SearchOutlined />} style={{ width: 200 }} />
                </Form.Item>
                <Form.Item label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 120 }}>
                    <Select.Option value="active">启用</Select.Option>
                    <Select.Option value="inactive">禁用</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary">搜索</Button>
                    <Button>重置</Button>
                  </Space>
                </Form.Item>
              </Form>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={roles}
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
              title={editingItem ? '编辑角色' : '新增角色'}
              open={modalVisible}
              onCancel={() => setModalVisible(false)}
              onOk={handleSubmit}
              width={600}
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="角色名称"
                      rules={[{ required: true, message: '请输入角色名称' }]}
                    >
                      <Input placeholder="请输入角色名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label="角色编码"
                      rules={[{ required: true, message: '请输入角色编码' }]}
                    >
                      <Input placeholder="如: dept_admin" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
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
                  <Input.TextArea rows={3} placeholder="请输入角色描述" />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="权限分配"
              open={permissionVisible}
              onCancel={() => setPermissionVisible(false)}
              onOk={handlePermissionSubmit}
              width={800}
            >
              <Transfer
                dataSource={mockPermissions}
                titles={['可分配权限', '已分配权限']}
                targetKeys={targetKeys}
                onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
                render={(item) => ({
                  label: `${item.title} (${item.description})`,
                  key: item.key,
                })}
                listStyle={{ width: 350, height: 400 }}
                showSearch
                searchPlaceholder="搜索权限"
              />
            </Modal>

            <Modal
              title="角色详情"
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
                <>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="角色名称">{selectedItem.name}</Descriptions.Item>
                    <Descriptions.Item label="角色编码">{selectedItem.code}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={selectedItem.status === 'active' ? 'green' : 'red'}>
                        {selectedItem.status === 'active' ? '启用' : '禁用'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="权限数量">
                      <Tag color="blue">{selectedItem.permissionIds?.length || 0} 个</Tag>
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
                  {selectedItem.permissionIds && selectedItem.permissionIds.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <h4 style={{ marginBottom: 12 }}>权限列表</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {selectedItem.permissionIds.map(id => {
                            const perm = mockPermissions.find(p => p.key === id)
                            return perm ? (
                              <Tag key={id} color="blue">{perm.title}</Tag>
                            ) : null
                          })}
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
