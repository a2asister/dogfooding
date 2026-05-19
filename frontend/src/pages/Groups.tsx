import { useEffect, useState } from 'react'
import { Table, Button, Input, Modal, Form, Space, message, Popconfirm, Tag, Card, Select } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FolderOpenOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { groupApi, userApi } from '@/services'
import type { Group } from '@/types'
import { isSuperAdmin } from '@/utils/permission'
import { useAuthStore } from '@/store/auth'

export default function Groups() {
  const [list, setList] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [form] = Form.useForm()
  const [users, setUsers] = useState<any[]>([])
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    loadList()
    loadUsers()
  }, [])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await groupApi.getAll()
      let data = res.data.data.map((g: any) => ({
        ...g,
        leaderId: g.leader_id,
        leaderName: g.leader_name
      }))
      if (keyword) {
        data = data.filter((g: Group) => g.name.includes(keyword))
      }
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await userApi.getList({ pageSize: 1000 })
      setUsers(res.data.data.list)
    } catch {
      // ignore
    }
  }

  const handleAdd = () => {
    setEditingGroup(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Group) => {
    setEditingGroup(record)
    form.setFieldsValue({
      ...record,
      leaderId: record.leaderId
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingGroup) {
        await groupApi.update(editingGroup.id, values)
        message.success('更新成功')
      } else {
        await groupApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadList()
    } catch {
      // error handled
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await groupApi.delete(id)
      message.success('删除成功')
      loadList()
    } catch {
      // error handled
    }
  }

  const handleArchive = async (id: number, archived: boolean) => {
    try {
      if (archived) {
        await groupApi.unarchive(id)
      } else {
        await groupApi.archive(id)
      }
      message.success('操作成功')
      loadList()
    } catch {
      // error handled
    }
  }

  const columns: ColumnsType<Group> = [
    { title: '分组名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '负责人', dataIndex: 'leaderName', key: 'leaderName' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '正常' : '已归档'}
        </Tag>
      )
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            icon={record.status === 'active' ? <FolderOpenOutlined /> : <ReloadOutlined />}
            onClick={() => handleArchive(record.id, record.status === 'archived')}
          >
            {record.status === 'active' ? '归档' : '恢复'}
          </Button>
          {isSuperAdmin(currentUser?.role) && (
            <Popconfirm title="确定删除该分组？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">分组管理</h2>
        {isSuperAdmin(currentUser?.role) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建分组
          </Button>
        )}
      </div>

      <Card>
        <Input
          placeholder="搜索分组名称"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 240, marginBottom: 16 }}
          allowClear
          onPressEnter={loadList}
        />

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingGroup ? '编辑分组' : '新建分组'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分组名称" rules={[{ required: true, message: '请输入分组名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="leaderId" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
            <Select placeholder="选择负责人">
              {users.map((u) => (
                <Select.Option key={u.id} value={u.id}>{u.nickname || u.username}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
