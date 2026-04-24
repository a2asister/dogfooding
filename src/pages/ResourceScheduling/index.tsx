import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, Modal, message, Descriptions, Tabs, Badge, Timeline, Row, Col, Statistic, Popconfirm } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, SyncOutlined, ScheduleOutlined } from '@ant-design/icons'
import type { Resource } from '@/types'
import { api } from '@/services/api'

const { TabPane } = Tabs

const resourceTypeLabels: Record<string, string> = {
  gate: '登机口',
  stand: '停机位',
  bridge: '廊桥',
}

const resourceTypeColors: Record<string, string> = {
  gate: 'blue',
  stand: 'green',
  bridge: 'purple',
}

const statusColors: Record<string, string> = {
  available: 'success',
  occupied: 'error',
  maintenance: 'warning',
  reserved: 'processing',
}

const statusLabels: Record<string, string> = {
  available: '可用',
  occupied: '占用',
  maintenance: '维护',
  reserved: '预留',
}

const ResourceScheduling: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
    type: '',
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await api.get('/resources')
      setResources(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: Resource) => {
    setSelectedResource(record)
    setDetailModalVisible(true)
  }

  const handleAllocate = (_record: Resource) => {
    Modal.info({
      title: '资源分配',
      content: '请选择航班进行资源分配',
      okText: '确认',
    })
  }

  const handleRelease = (record: Resource) => {
    message.success(`资源 ${record.name} 已释放`)
    fetchResources()
  }

  const getFilteredResources = () => {
    let filtered = resources
    if (activeTab !== 'all') {
      filtered = filtered.filter(r => r.type === activeTab)
    }
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      filtered = filtered.filter(r => 
        r.code.toLowerCase().includes(keyword) || 
        r.name.toLowerCase().includes(keyword)
      )
    }
    if (searchParams.status) {
      filtered = filtered.filter(r => r.status === searchParams.status)
    }
    return filtered
  }

  const columns = [
    {
      title: '资源编码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, _record: Resource) => (
        <strong style={{ color: '#1890ff' }}>{text}</strong>
      ),
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={resourceTypeColors[type]}>
          {resourceTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: '航站楼',
      dataIndex: 'terminal',
      key: 'terminal',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={statusColors[status] as 'success' | 'error' | 'warning' | 'processing'}>
          <Tag color={statusColors[status]}>
            {statusLabels[status]}
          </Tag>
        </Badge>
      ),
    },
    {
      title: '当前航班',
      key: 'currentFlight',
      render: (_: unknown, record: Resource) => (
        record.currentFlightNo ? (
          <Tag color="blue">{record.currentFlightNo}</Tag>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        )
      ),
    },
    {
      title: '下一航班',
      key: 'nextFlight',
      render: (_: unknown, record: Resource) => (
        record.nextFlightNo ? (
          <Tag color="orange">{record.nextFlightNo}</Tag>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        )
      ),
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity} 人`,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Resource) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          {record.status === 'available' && (
            <Button type="primary" size="small" onClick={() => handleAllocate(record)}>
              分配
            </Button>
          )}
          {record.status === 'occupied' && (
            <Popconfirm title="确定要释放该资源吗？" onConfirm={() => handleRelease(record)}>
              <Button size="small" danger>释放</Button>
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
            title="资源总数"
            value={resources.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="可用资源"
            value={resources.filter(r => r.status === 'available').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="占用资源"
            value={resources.filter(r => r.status === 'occupied').length}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="维护中"
            value={resources.filter(r => r.status === 'maintenance').length}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>资源调度</h2>
        <p style={{ margin: 0, color: '#666' }}>管理机位、廊桥、登机口等核心资源的分配与调度</p>
      </div>

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索资源编码/名称"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            />
            <Select
              placeholder="资源状态"
              style={{ width: 150 }}
              allowClear
              value={searchParams.status || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>{label}</Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<SyncOutlined />} onClick={fetchResources}>刷新</Button>
            <Button type="primary" ghost icon={<ScheduleOutlined />}>智能分配</Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部资源" key="all" />
          <TabPane tab="登机口" key="gate" />
          <TabPane tab="停机位" key="stand" />
          <TabPane tab="廊桥" key="bridge" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={getFilteredResources()}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="资源详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />}>编辑</Button>,
        ]}
        width={700}
      >
        {selectedResource && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="资源编码">{selectedResource.code}</Descriptions.Item>
              <Descriptions.Item label="资源名称">{selectedResource.name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={resourceTypeColors[selectedResource.type]}>
                  {resourceTypeLabels[selectedResource.type]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="航站楼">{selectedResource.terminal}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[selectedResource.status]}>
                  {statusLabels[selectedResource.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="容量">{selectedResource.capacity} 人</Descriptions.Item>
              <Descriptions.Item label="当前航班">{selectedResource.currentFlightNo || '无'}</Descriptions.Item>
              <Descriptions.Item label="下一航班">{selectedResource.nextFlightNo || '无'}</Descriptions.Item>
              <Descriptions.Item label="上次维护">{selectedResource.lastMaintenance}</Descriptions.Item>
              <Descriptions.Item label="下次维护">{selectedResource.nextMaintenance}</Descriptions.Item>
            </Descriptions>

            <Card title="设备配置" style={{ marginTop: 16 }} size="small">
              <Space>
                {selectedResource.equipment?.map((eq, i) => (
                  <Tag key={i}>{eq}</Tag>
                ))}
              </Space>
            </Card>

            <Card title="使用记录" style={{ marginTop: 16 }} size="small">
              <Timeline>
                <Timeline.Item color="blue">
                  <strong>MU5102</strong> - 已完成
                  <div style={{ color: '#999', fontSize: 12 }}>08:00 - 09:30</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>CA1234</strong> - 当前使用中
                  <div style={{ color: '#999', fontSize: 12 }}>10:00 - 11:30</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <strong>MU5678</strong> - 待分配
                  <div style={{ color: '#999', fontSize: 12 }}>12:00 - 13:30</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ResourceScheduling
