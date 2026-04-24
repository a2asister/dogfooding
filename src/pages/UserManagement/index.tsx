import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, Modal, Form, message, Descriptions, Popconfirm, Switch, Avatar, Row, Col, Statistic } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, LockOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import type { User } from '@/types'
import { api } from '@/services/api'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
    role: '',
  })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: User) => {
    setSelectedUser(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: User) => {
    form.setFieldsValue({
      ...record,
    })
    setSelectedUser(record)
    setFormModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    message.success('删除成功')
    fetchUsers()
  }

  const handleFormSubmit = (_values: Record<string, unknown>) => {
    message.success(selectedUser ? '更新成功' : '创建成功')
    setFormModalVisible(false)
    form.resetFields()
    fetchUsers()
  }

  const handleToggleStatus = (record: User, checked: boolean) => {
    message.success(`${record.name} 状态已${checked ? '启用' : '禁用'}`)
    fetchUsers()
  }

  const handleResetPassword = (record: User) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 ${record.name} 的密码吗？`,
      onOk: () => {
        message.success('密码已重置为：123456')
      },
    })
  }

  const columns = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><strong>{record.name}</strong></div>
            <div style={{ color: '#999', fontSize: 12 }}>@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: unknown, record: User) => (
        <div>
          <div>{record.phone}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: User) => (
        <Space>
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? '启用' : '禁用'}
          </Tag>
          <Switch
            size="small"
            checked={status === 'active'}
            onChange={(checked) => handleToggleStatus(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleResetPassword(record)}>
            重置密码
          </Button>
          <Popconfirm title="确定要删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="用户总数"
            value={users.length}
            valueStyle={{ color: '#1890ff' }}
            prefix={<TeamOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="活跃用户"
            value={users.filter(u => u.status === 'active').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="禁用用户"
            value={users.filter(u => u.status === 'inactive').length}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="角色数量"
            value={5}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>账号管理</h2>
        <p style={{ margin: 0, color: '#666' }}>管理系统用户账号、角色分配及权限配置</p>
      </div>

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索用户名/姓名/部门"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            />
            <Select
              placeholder="用户状态"
              style={{ width: 150 }}
              allowClear
              value={searchParams.status || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
            >
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
            <Select
              placeholder="角色筛选"
              style={{ width: 150 }}
              allowClear
              value={searchParams.role || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, role: value })}
            >
              <Select.Option value="超级管理员">超级管理员</Select.Option>
              <Select.Option value="航班管理员">航班管理员</Select.Option>
              <Select.Option value="旅客服务专员">旅客服务专员</Select.Option>
              <Select.Option value="安防管理员">安防管理员</Select.Option>
              <Select.Option value="设备运维员">设备运维员</Select.Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedUser(null); setFormModalVisible(true); }}>
              新增用户
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" onClick={() => { setDetailModalVisible(false); handleEdit(selectedUser!); }}>
            编辑
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar size={80} icon={<UserOutlined />} />
            <h3 style={{ marginTop: 16, marginBottom: 8 }}>{selectedUser.name}</h3>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 16px' }}>
              {selectedUser.role}
            </Tag>
          </div>
        )}
        {selectedUser && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="用户名">{selectedUser.username}</Descriptions.Item>
            <Descriptions.Item label="姓名">{selectedUser.name}</Descriptions.Item>
            <Descriptions.Item label="角色">{selectedUser.role}</Descriptions.Item>
            <Descriptions.Item label="部门">{selectedUser.department}</Descriptions.Item>
            <Descriptions.Item label="手机号">{selectedUser.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUser.status === 'active' ? 'green' : 'red'}>
                {selectedUser.status === 'active' ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedUser.createdAt}</Descriptions.Item>
            <Descriptions.Item label="最后登录" span={2}>
              {selectedUser.lastLogin || '从未登录'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={selectedUser ? '编辑用户' : '新增用户'}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!selectedUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleId"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Select.Option value="1">超级管理员</Select.Option>
                  <Select.Option value="2">航班管理员</Select.Option>
                  <Select.Option value="3">旅客服务专员</Select.Option>
                  <Select.Option value="4">安防管理员</Select.Option>
                  <Select.Option value="5">设备运维员</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
                rules={[{ required: true, message: '请输入部门' }]}
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, message: '请输入邮箱' }]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          {!selectedUser && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setFormModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">确认</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
