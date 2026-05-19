import { useEffect, useState } from 'react'
import { Table, Button, Input, Select, Tag, Modal, Form, Space, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, SearchOutlined, UserAddOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { userApi, groupApi } from '@/services'
import type { User } from '@/types'
import { roleLabels, roleColors, isSuperAdmin } from '@/utils/permission'
import { useAuthStore } from '@/store/auth'

export default function Users() {
  const [list, setList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [roleFilter, setRoleFilter] = useState<string | undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [groups, setGroups] = useState<any[]>([])
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    loadList()
    loadGroups()
  }, [page, pageSize, keyword, statusFilter, roleFilter])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await userApi.getList({ page, pageSize, keyword, role: roleFilter, status: statusFilter })
      setList(res.data.data.list)
      setTotal(res.data.data.total)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    if (isSuperAdmin(currentUser?.role)) {
      const res = await groupApi.getAll()
      setGroups(res.data.data)
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await userApi.update(editingUser.id, values)
        message.success('更新成功')
      } else {
        await userApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadList()
    } catch {
      // error handled in interceptor
    }
  }

  const handleBatchAction = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择用户')
      return
    }
    try {
      await userApi.batchAction(selectedRowKeys.map(Number), action)
      message.success('操作成功')
      setSelectedRowKeys([])
      loadList()
    } catch {
      // error handled
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      loadList()
    } catch {
      // error handled
    }
  }

  const columns: ColumnsType<User> = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role as keyof typeof roleColors]}>{roleLabels[role as keyof typeof roleLabels]}</Tag>
    },
    { title: '所属分组', dataIndex: 'groupName', key: 'groupName' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          {isSuperAdmin(currentUser?.role) && record.id !== currentUser?.id && (
            <Popconfirm title="确定删除该用户？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">用户管理</h2>
        <Space>
          {isSuperAdmin(currentUser?.role) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加用户
            </Button>
          )}
        </Space>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索用户名/昵称/邮箱"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="角色筛选"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 150 }}
            allowClear
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态筛选"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="active">正常</Select.Option>
            <Select.Option value="disabled">禁用</Select.Option>
          </Select>
        </Space>

        {selectedRowKeys.length > 0 && (
          <Space style={{ marginBottom: 16 }}>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button icon={<UnlockOutlined />} onClick={() => handleBatchAction('enable')}>
              批量启用
            </Button>
            <Button icon={<LockOutlined />} onClick={() => handleBatchAction('disable')}>
              批量禁用
            </Button>
            <Button icon={<UserAddOutlined />} onClick={() => handleBatchAction('freeze')}>
              一键冻结（离职）
            </Button>
          </Space>
        )}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) }
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: !editingUser, message: '请输入用户名' }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: !editingUser, message: '请输入邮箱' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          {isSuperAdmin(currentUser?.role) && (
            <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="groupId" label="所属分组">
            <Select>
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
