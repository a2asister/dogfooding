import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Modal, Form, message, Descriptions, Popconfirm, Row, Col, Statistic, Checkbox, Divider } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { Role } from '@/types'
import { api } from '@/services/api'

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [form] = Form.useForm()

  const allPermissions = [
    { value: 'dashboard', label: '运营概览' },
    { value: 'flight', label: '航班管理' },
    { value: 'passenger', label: '旅客服务' },
    { value: 'baggage', label: '行李管理' },
    { value: 'resource', label: '资源调度' },
    { value: 'security', label: '安防应急' },
    { value: 'equipment', label: '设备运维' },
    { value: 'data', label: '数据决策' },
    { value: 'system_users', label: '账号管理' },
    { value: 'system_roles', label: '角色权限' },
    { value: 'system_logs', label: '操作日志' },
  ]

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await api.get('/roles')
      setRoles(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: Role) => {
    setSelectedRole(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: Role) => {
    form.setFieldsValue({
      ...record,
    })
    setSelectedRole(record)
    setFormModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    message.success('删除成功')
    fetchRoles()
  }

  const handleFormSubmit = (_values: Record<string, unknown>) => {
    message.success(selectedRole ? '更新成功' : '创建成功')
    setFormModalVisible(false)
    form.resetFields()
    fetchRoles()
  }

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
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
      render: (_: unknown, record: Role) => (
        <Tag color={record.permissions?.length > 5 ? 'green' : 'orange'}>
          {record.permissions?.length || 0} 个权限
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Role) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.code !== 'super_admin' && (
            <Popconfirm title="确定要删除该角色吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="角色总数"
            value={roles.length}
            valueStyle={{ color: '#1890ff' }}
            prefix={<SafetyCertificateOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="启用角色"
            value={roles.filter(r => r.status === 'active').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="禁用角色"
            value={roles.filter(r => r.status === 'inactive').length}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="总权限数"
            value={allPermissions.length}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>角色权限管理</h2>
        <p style={{ margin: 0, color: '#666' }}>配置系统角色及权限分配，实现多角色分级权限管控</p>
      </div>

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索角色名称/编码"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedRole(null); setFormModalVisible(true); }}>
              新增角色
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="角色详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" onClick={() => { setDetailModalVisible(false); handleEdit(selectedRole!); }}>
            编辑
          </Button>,
        ]}
      >
        {selectedRole && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="角色名称">{selectedRole.name}</Descriptions.Item>
              <Descriptions.Item label="角色编码">{selectedRole.code}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRole.status === 'active' ? 'green' : 'red'}>
                  {selectedRole.status === 'active' ? '启用' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRole.createdAt}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{selectedRole.description}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h4 style={{ marginBottom: 16 }}>权限列表</h4>
              <Checkbox.Group
                options={allPermissions}
                value={selectedRole.permissions}
                disabled
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={selectedRole ? '编辑角色' : '新增角色'}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        width={700}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
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
                <Input placeholder="请输入角色编码" disabled={!!selectedRole} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限配置"
          >
            <div>
              <h4 style={{ marginBottom: 12 }}>请选择该角色拥有的权限：</h4>
              <Checkbox.Group
                options={allPermissions}
              />
            </div>
          </Form.Item>
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

export default RoleManagement
