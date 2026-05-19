import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Space, message, Popconfirm, Tag, Card } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { apiApi, projectApi } from '@/services'
import type { Api, Project } from '@/types'
import { canEditApi, canDeleteApi } from '@/utils/permission'
import { useAuthStore } from '@/store/auth'

const methodColors: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'cyan',
  HEAD: 'purple',
  OPTIONS: 'default'
}

export default function Apis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [list, setList] = useState<Api[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [method, setMethod] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const currentUser = useAuthStore((state) => state.user)
  const projectId = Number(id)

  useEffect(() => {
    loadProject()
    loadList()
  }, [projectId, page, pageSize, keyword, method, status])

  const loadProject = async () => {
    try {
      const res = await projectApi.getDetail(projectId)
      setProject(res.data.data)
    } catch {
      // ignore
    }
  }

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await apiApi.getList({ projectId, page, pageSize, keyword, method, status })
      const list = res.data.data.list.map((item: any) => ({
        ...item,
        mockEnabled: item.mock_enabled,
        creatorName: item.creator_name,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
      setList(list)
      setTotal(res.data.data.total)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiApi.delete(id)
      message.success('删除成功')
      loadList()
    } catch {
      // error handled
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的接口')
      return
    }
    try {
      await apiApi.batchDelete(selectedRowKeys.map(Number))
      message.success('批量删除成功')
      setSelectedRowKeys([])
      loadList()
    } catch {
      // error handled
    }
  }

  const isProjectAdmin = project?.leaderId === currentUser?.id
  const isMember = true // 项目成员都可以编辑，这里简化处理

  const columns: ColumnsType<Api> = [
    { title: '接口名称', dataIndex: 'name', key: 'name' },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (m: string) => <Tag color={methodColors[m]}>{m}</Tag>
    },
    { title: '路径', dataIndex: 'path', key: 'path' },
    {
      title: 'Mock',
      dataIndex: 'mockEnabled',
      key: 'mockEnabled',
      width: 80,
      render: (enabled: number) => (
        <Tag color={enabled ? 'green' : 'default'}>
          {enabled ? '开启' : '关闭'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <Tag color={s === 'published' ? 'green' : 'orange'}>
          {s === 'published' ? '已发布' : '草稿'}
        </Tag>
      )
    },
    { title: '创建人', dataIndex: 'creatorName', key: 'creatorName' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => window.open(`/mock${record.path}`, '_blank')}
            disabled={!record.mockEnabled}
          >
            测试
          </Button>
          {canEditApi(currentUser?.role, isProjectAdmin, isMember) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/projects/${projectId}/apis/${record.id}`)}
            >
              编辑
            </Button>
          )}
          {canDeleteApi(currentUser?.role, isProjectAdmin) && (
            <Popconfirm title="确定删除该接口？" onConfirm={() => handleDelete(record.id)}>
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
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>
            返回项目
          </Button>
          <h2 className="page-title">接口管理 - {project?.name}</h2>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/projects/${projectId}/apis/new`)}>
          新建接口
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索接口名称/路径"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="请求方法"
            value={method}
            onChange={setMethod}
            style={{ width: 120 }}
            allowClear
          >
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
              <Select.Option key={m} value={m}>{m}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            value={status}
            onChange={setStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
          </Select>
        </Space>

        {selectedRowKeys.length > 0 && (
          <Space style={{ marginBottom: 16 }}>
            <span>已选择 {selectedRowKeys.length} 项</span>
            <Button danger onClick={handleBatchDelete}>批量删除</Button>
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
    </div>
  )
}
