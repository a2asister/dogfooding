import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Tag, Space, Input, Select, DatePicker, Popconfirm, message, Avatar, Badge, Typography, Empty } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, TeamOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import type { ColumnsType } from 'antd/es/table'
import type { Project } from '@/types'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const Projects: React.FC = () => {
  const navigate = useNavigate()
  const { projects, fetchProjects, deleteProject } = useProjectStore()
  const { openModal } = useUIStore()
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | undefined>()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter(p => {
    const matchSearch = !searchText || 
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.key.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchCategory = !filterCategory || p.category === filterCategory
    
    return matchSearch && matchCategory
  })

  const handleDelete = async (id: string) => {
    const success = await deleteProject(id)
    if (success) {
      message.success('项目已删除')
    } else {
      message.error('删除失败')
    }
  }

  const columns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
      <Space>
        <Avatar
          style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }}
          size="large"
        >
          {text.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div>
            <a onClick={() => navigate(`/projects/${record.id}`)} style={{ fontSize: 16, fontWeight: 500 }}>
              {text}
            </a>
            <Tag color="blue" style={{ marginLeft: 8 }}>{record.key}</Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description || '暂无描述'}
          </Text>
        </div>
      </Space>
    ),
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => {
        const categoryMap: Record<string, { label: string; color: string }> = {
          software: { label: '软件项目', color: 'blue' },
          business: { label: '业务项目', color: 'green' },
          ops: { label: '运维项目', color: 'orange' },
        }
        const info = categoryMap[category] || { label: category, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '公开状态',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      render: (isPublic) => (
      <Badge status={isPublic ? 'success' : 'default'} text={isPublic ? '公开' : '私有'} />
    ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
      <Space size="small">
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/projects/${record.id}`)}
        >
          查看
        </Button>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openModal('editProject', { project: record })}
        >
          编辑
        </Button>
        <Popconfirm
          title="确认删除"
          description="删除项目将同时删除所有相关数据，此操作不可恢复？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>项目列表</Title>
          <Text type="secondary">管理和查看所有项目</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal('createProject')}
          size="large"
        >
          新建项目
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索项目名称、标识或描述..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="项目类型"
            value={filterCategory}
            onChange={setFilterCategory}
            allowClear
            style={{ width: 150 }}
            options={[
              { value: 'software', label: '软件项目' },
              { value: 'business', label: '业务项目' },
              { value: 'ops', label: '运维项目' },
            ]}
          />
          <RangePicker style={{ width: 280 }} placeholder={['开始日期', '结束日期']} />
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个项目`,
          }}
          locale={{
            emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无项目"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal('createProject')}
              >
                创建第一个项目
              </Button>
            </Empty>
          ),
          }}
        />
      </Card>
    </div>
  )
}

export default Projects
