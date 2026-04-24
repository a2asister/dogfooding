import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, Modal, message, Descriptions, Timeline, Badge, Alert, Row, Col, Statistic } from 'antd'
import { SearchOutlined, EyeOutlined, SyncOutlined } from '@ant-design/icons'
import type { Baggage } from '@/types'
import { api } from '@/services/api'

const statusColors: Record<string, string> = {
  'check-in': 'default',
  loaded: 'blue',
  unloaded: 'green',
  transit: 'processing',
  delivered: 'success',
  lost: 'error',
  damaged: 'warning',
}

const statusLabels: Record<string, string> = {
  'check-in': '托运中',
  loaded: '已装机',
  unloaded: '已卸机',
  transit: '中转',
  delivered: '已交付',
  lost: '丢失',
  damaged: '损坏',
}

const BaggageManagement: React.FC = () => {
  const [baggage, setBaggage] = useState<Baggage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBaggage, setSelectedBaggage] = useState<Baggage | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
  })

  useEffect(() => {
    fetchBaggage()
  }, [])

  const fetchBaggage = async () => {
    setLoading(true)
    try {
      const response = await api.get('/baggage')
      setBaggage(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch baggage:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: Baggage) => {
    setSelectedBaggage(record)
    setDetailModalVisible(true)
  }

  const handleAbnormal = (_record: Baggage) => {
    Modal.confirm({
      title: '异常处理',
      content: '请选择异常类型进行处理',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        message.success('异常已登记')
        fetchBaggage()
      },
    })
  }

  const columns = [
    {
      title: '行李标签号',
      dataIndex: 'tagNo',
      key: 'tagNo',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '旅客姓名',
      dataIndex: 'passengerName',
      key: 'passengerName',
    },
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '重量',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight} kg`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'checked' ? 'blue' : 'green'}>
          {type === 'checked' ? '托运行李' : '随身携带'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'lost' || status === 'damaged' ? 'error' : 'success'}>
          <Tag color={statusColors[status] || 'default'}>
            {statusLabels[status] || status}
          </Tag>
        </Badge>
      ),
    },
    {
      title: '当前位置',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Baggage) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            轨迹
          </Button>
          {record.status === 'lost' || record.status === 'damaged' ? (
            <Button type="primary" size="small" danger onClick={() => handleAbnormal(record)}>
              处理
            </Button>
          ) : (
            <Button type="link" size="small" icon={<SyncOutlined />}>
              更新
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const abnormalCount = baggage.filter(b => b.status === 'lost' || b.status === 'damaged').length

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="今日行李总量"
            value={baggage.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="托运行李"
            value={baggage.filter(b => b.type === 'checked').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="已交付"
            value={baggage.filter(b => b.status === 'delivered').length}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="异常行李"
            value={abnormalCount}
            valueStyle={{ color: abnormalCount > 0 ? '#f5222d' : '#999' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>行李管理</h2>
        <p style={{ margin: 0, color: '#666' }}>管理行李托运、轨迹追踪、异常处理及理赔</p>
      </div>

      {abnormalCount > 0 && (
        <Alert
          message={`存在 ${abnormalCount} 件异常行李需要处理`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger>
              立即处理
            </Button>
          }
        />
      )}

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索标签号/旅客姓名/航班号"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            />
            <Select
              placeholder="行李状态"
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
            <Button icon={<SyncOutlined />} onClick={fetchBaggage}>刷新</Button>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={baggage}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="行李轨迹追踪"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {selectedBaggage && (
          <div>
            <Card title="行李基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={3} size="small">
                <Descriptions.Item label="标签号">
                  <strong>{selectedBaggage.tagNo}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="旅客姓名">{selectedBaggage.passengerName}</Descriptions.Item>
                <Descriptions.Item label="航班号">
                  <Tag color="blue">{selectedBaggage.flightNo}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="重量">{selectedBaggage.weight} kg</Descriptions.Item>
                <Descriptions.Item label="类型">
                  {selectedBaggage.type === 'checked' ? '托运行李' : '随身携带'}
                </Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={statusColors[selectedBaggage.status]}>
                    {statusLabels[selectedBaggage.status]}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="运输轨迹" size="small">
              {selectedBaggage.history && selectedBaggage.history.length > 0 ? (
                <Timeline>
                  {[...selectedBaggage.history].reverse().map((item, index) => (
                    <Timeline.Item
                      key={item.id}
                      color={index === 0 ? 'green' : 'blue'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <strong>{item.action}</strong>
                          <div style={{ color: '#666' }}>{item.location}</div>
                          <div style={{ color: '#999', fontSize: 12 }}>操作员: {item.operator}</div>
                        </div>
                        <div style={{ color: '#999' }}>{item.timestamp}</div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>
                  暂无轨迹数据
                </div>
              )}
            </Card>

            {(selectedBaggage.status === 'lost' || selectedBaggage.status === 'damaged') && (
              <Card title="异常信息" size="small" style={{ marginTop: 16 }} type="inner">
                <Alert
                  message={selectedBaggage.status === 'lost' ? '行李丢失告警' : '行李损坏告警'}
                  description="该行李存在异常状态，请立即处理并登记理赔信息。"
                  type="error"
                  showIcon
                  action={
                    <Button size="small" type="primary" danger>
                      登记处理
                    </Button>
                  }
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default BaggageManagement
