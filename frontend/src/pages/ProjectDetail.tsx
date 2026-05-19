import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Space, Tabs, Table, Modal, Form, Select, message, Popconfirm, Tag } from 'antd'
import { ArrowLeftOutlined, UserAddOutlined, ApiOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { projectApi, userApi } from '@/services'
import type { Project, ProjectMember, User } from '@/types'
import { roleLabels, roleColors, canManageProjectMembers, isSuperAdmin, isGroupAdmin } from '@/utils/permission'
import { useAuthStore } from '@/store/auth'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [memberModalVisible, setMemberModalVisible] = useState(false)
  const [memberForm] = Form.useForm()
  const currentUser = useAuthStore((state) => state.user)
  const projectId = Number(id)

  useEffect(() => {
    loadProject()
    loadMembers()
    loadUsers()
  }, [projectId])

  const loadProject = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getDetail(projectId)
      setProject(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const res = await projectApi.getMembers(projectId)
      setMembers(res.data.data)
    } catch {
      // ignore
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

  const isProjectAdmin = members.some(m => m.userId === currentUser?.id && m.role === 'project_admin')
  const canManage = canManageProjectMembers(currentUser?.role, isProjectAdmin)

  const handleAddMember = async () => {
    try {
      const values = await memberForm.validateFields()
      await projectApi.addMembers(projectId, values.userIds, values.role)
      message.success('添加成功')
      setMemberModalVisible(false)
      loadMembers()
    } catch {
      // error handled
    }
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      await projectApi.removeMember(projectId, userId)
      message.success('移除成功')
      loadMembers()
    } catch {
      // error handled
    }
  }

  const memberColumns: ColumnsType<ProjectMember> = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role as keyof typeof roleColors]}>
          {roleLabels[role as keyof typeof roleLabels]}
        </Tag>
      )
    },
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
    { title: '加入时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => canManage && (
        <Popconfirm title="确定移除该成员？" onConfirm={() => handleRemoveMember(record.userId)}>
          <Button type="link" danger>移除</Button>
        </Popconfirm>
      )
    }
  ]

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: project && (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="所属分组">{project.groupName}</Descriptions.Item>
          <Descriptions.Item label="负责人">{project.leaderName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={project.status === 'active' ? 'green' : 'default'}>
              {project.status === 'active' ? '正常' : '已归档'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="基础域名">{project.baseUrl || '-'}</Descriptions.Item>
          <Descriptions.Item label="超时时间">{project.timeout}ms</Descriptions.Item>
          <Descriptions.Item label="响应格式">{project.responseFormat}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{project.createdAt}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{project.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="全局请求头" span={2}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{project.globalHeaders || '-'}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="全局参数" span={2}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{project.globalParams || '-'}</pre>
          </Descriptions.Item>
        </Descriptions>
      )
    },
    {
      key: 'members',
      label: '项目成员',
      children: (
        <div>
          {canManage && (
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => setMemberModalVisible(true)}>
                添加成员
              </Button>
            </Space>
          )}
          <Table
            rowKey="id"
            columns={memberColumns}
            dataSource={members}
            pagination={{ pageSize: 20 }}
          />
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            返回
          </Button>
          <h2 className="page-title">{project?.name || '项目详情'}</h2>
        </Space>
        <Space>
          <Button icon={<ApiOutlined />} onClick={() => navigate(`/projects/${projectId}/apis`)}>
            接口管理
          </Button>
          <Button icon={<SettingOutlined />} onClick={() => navigate(`/projects/${projectId}/apis/new`)}>
            新建接口
          </Button>
        </Space>
      </div>

      <Card loading={loading}>
        <Tabs defaultActiveKey="info" items={tabItems} />
      </Card>

      <Modal
        title="添加项目成员"
        open={memberModalVisible}
        onOk={handleAddMember}
        onCancel={() => setMemberModalVisible(false)}
        destroyOnClose
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item
            name="userIds"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择要添加的用户"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users
                .filter(u => !members.some(m => m.userId === u.id))
                .filter(u => isSuperAdmin(currentUser?.role) || isGroupAdmin(currentUser?.role) || u.status === 'active')
                .map(u => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.nickname || u.username} ({u.username})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="项目角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select>
              <Select.Option value="project_admin">项目管理员</Select.Option>
              <Select.Option value="member">普通成员</Select.Option>
              <Select.Option value="guest">访客</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
