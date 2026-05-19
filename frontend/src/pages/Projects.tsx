import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Modal, Form, Space, message, Popconfirm, Tag, Card } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ApiOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { projectApi, groupApi } from '@/services'
import type { Project } from '@/types'
import { canCreateProject, isSuperAdmin, isGroupAdmin } from '@/utils/permission'
import { useAuthStore } from '@/store/auth'

export default function Projects() {
  const navigate = useNavigate()
  const [list, setList] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [groupId, setGroupId] = useState<number | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form] = Form.useForm()
  const [groups, setGroups] = useState<any[]>([])
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    loadList()
    loadGroups()
  }, [page, pageSize, keyword, groupId])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getList({ page, pageSize, groupId, keyword })
      const list = res.data.data.list.map((item: any) => ({
        ...item,
        groupId: item.group_id,
        leaderId: item.leader_id,
        baseUrl: item.base_url,
        globalHeaders: item.global_headers,
        globalParams: item.global_params,
        responseFormat: item.response_format,
        groupName: item.group_name,
        leaderName: item.leader_name,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
      setList(list)
      setTotal(res.data.data.total)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const res = isSuperAdmin(currentUser?.role) ? await groupApi.getAll() : await groupApi.getList()
      setGroups(res.data.data)
    } catch {
      // ignore
    }
  }

  const handleAdd = () => {
    setEditingProject(null)
    form.resetFields()
    form.setFieldsValue({
      groupId: groups[0]?.id,
      timeout: 30000,
      responseFormat: 'json',
      status: 'active'
    })
    setModalVisible(true)
  }

  const handleEdit = (record: Project) => {
    setEditingProject(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingProject) {
        await projectApi.update(editingProject.id, values)
        message.success('更新成功')
      } else {
        await projectApi.create(values)
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
      await projectApi.delete(id)
      message.success('删除成功')
      loadList()
    } catch {
      // error handled
    }
  }

  const columns: ColumnsType<Project> = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '所属分组', dataIndex: 'groupName', key: 'groupName' },
    { title: '负责人', dataIndex: 'leaderName', key: 'leaderName' },
    { title: '基础域名', dataIndex: 'baseUrl', key: 'baseUrl' },
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
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<ApiOutlined />}
            onClick={() => navigate(`/projects/${record.id}/apis`)}
          >
            接口
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {(isSuperAdmin(currentUser?.role) || isGroupAdmin(currentUser?.role)) && (
            <Popconfirm title="确定删除该项目？" onConfirm={() => handleDelete(record.id)}>
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
        <h2 className="page-title">项目管理</h2>
        {canCreateProject(currentUser?.role) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建项目
          </Button>
        )}
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索项目名称"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="选择分组"
            value={groupId}
            onChange={setGroupId}
            style={{ width: 200 }}
            allowClear
          >
            {groups.map((g) => (
              <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) }
          }}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="groupId" label="所属分组" rules={[{ required: true, message: '请选择分组' }]}>
            <Select disabled={!!editingProject && !isSuperAdmin(currentUser?.role)}>
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="baseUrl" label="接口基础域名">
            <Input placeholder="例如: https://api.example.com" />
          </Form.Item>
          <Form.Item name="timeout" label="超时时间(ms)">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="responseFormat" label="响应格式">
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="xml">XML</Select.Option>
              <Select.Option value="text">Text</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="globalHeaders" label="全局请求头(JSON)">
            <Input.TextArea rows={2} placeholder='{"Authorization": "Bearer xxx"}' />
          </Form.Item>
          <Form.Item name="globalParams" label="全局参数(JSON)">
            <Input.TextArea rows={2} placeholder='{"appId": "xxx"}' />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="archived">已归档</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
