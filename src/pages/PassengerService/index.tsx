import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, Modal, message, Descriptions, Tabs, Empty, Timeline, Row, Col, Statistic } from 'antd'
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import type { Passenger, Complaint } from '@/types'
import { api } from '@/services/api'

const { TabPane } = Tabs

const checkInColors: Record<string, string> = {
  pending: 'default',
  checked: 'success',
  boarded: 'blue',
}

const checkInLabels: Record<string, string> = {
  pending: '未值机',
  checked: '已值机',
  boarded: '已登机',
}

const complaintColors: Record<string, string> = {
  pending: 'warning',
  assigned: 'processing',
  processing: 'blue',
  resolved: 'success',
  closed: 'default',
}

const complaintLabels: Record<string, string> = {
  pending: '待处理',
  assigned: '已指派',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
}

const typeLabels: Record<string, string> = {
  service: '服务问题',
  luggage: '行李问题',
  facility: '设施问题',
  staff: '员工问题',
  other: '其他',
}

const PassengerService: React.FC = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('passengers')
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
  })

  useEffect(() => {
    fetchPassengers()
    fetchComplaints()
  }, [])

  const fetchPassengers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/passengers')
      setPassengers(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch passengers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints')
      setComplaints(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
    }
  }

  const handleDetail = (record: Passenger) => {
    setSelectedPassenger(record)
    setDetailModalVisible(true)
  }

  const handleCheckIn = (record: Passenger) => {
    message.success(`${record.name} 值机成功`)
    fetchPassengers()
  }

  const passengerColumns = [
    {
      title: '旅客姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Passenger) => (
        <div>
          <strong>{text}</strong>
          <div style={{ color: '#999', fontSize: 12 }}>
            {record.idCard ? `身份证: ${record.idCard.substring(0, 6)}****${record.idCard.substring(14)}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '座位',
      key: 'seat',
      render: (_: unknown, record: Passenger) => (
        <Space>
          <Tag>{record.seatNo}</Tag>
          <Tag color={record.seatClass === 'economy' ? 'default' : record.seatClass === 'business' ? 'blue' : 'gold'}>
            {record.seatClass === 'economy' ? '经济舱' : record.seatClass === 'business' ? '商务舱' : '头等舱'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '值机状态',
      dataIndex: 'checkInStatus',
      key: 'checkInStatus',
      render: (status: string) => (
        <Tag color={checkInColors[status] || 'default'}>
          {checkInLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: '特殊服务',
      dataIndex: 'specialService',
      key: 'specialService',
      render: (services: string[]) => (
        services && services.length > 0 ? (
          <Space>
            {services.map((s, i) => (
              <Tag key={i} color="orange">{s}</Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        )
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: unknown, record: Passenger) => (
        <div>
          <div>{record.phone}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Passenger) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          {record.checkInStatus === 'pending' && (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleCheckIn(record)}>
              值机
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const complaintColumns = [
    {
      title: '投诉编号',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <strong>{text}</strong>,
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
      title: '投诉类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => typeLabels[type] || type,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={complaintColors[status] || 'default'}>
          {complaintLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: '受理人',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (text: string) => text || '未分配',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '满意度',
      dataIndex: 'satisfactionScore',
      key: 'satisfactionScore',
      render: (score: number | null) => (
        score ? (
          <span style={{ color: score >= 4 ? '#52c41a' : score >= 3 ? '#faad14' : '#f5222d' }}>
            {score} 星
          </span>
        ) : (
          <span style={{ color: '#999' }}>未评价</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small">处理</Button>
      ),
    },
  ]

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="今日旅客"
            value={passengers.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="已值机"
            value={passengers.filter(p => p.checkInStatus === 'checked' || p.checkInStatus === 'boarded').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="待处理投诉"
            value={complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="特殊服务需求"
            value={passengers.filter(p => p.specialService && p.specialService.length > 0).length}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>旅客服务</h2>
        <p style={{ margin: 0, color: '#666' }}>管理旅客信息、值机选座、特殊服务及投诉处理</p>
      </div>

      {stats}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="旅客信息" key="passengers">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input
                  placeholder="搜索姓名/身份证/手机号"
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                />
                <Select
                  placeholder="值机状态"
                  style={{ width: 150 }}
                  allowClear
                  value={searchParams.status || undefined}
                  onChange={(value) => setSearchParams({ ...searchParams, status: value })}
                >
                  {Object.entries(checkInLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
                <Button type="primary" icon={<SearchOutlined />}>查询</Button>
              </Space>
            </div>
            <Table
              columns={passengerColumns}
              dataSource={passengers}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="投诉建议" key="complaints">
            <Table
              columns={complaintColumns}
              dataSource={complaints}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="特殊服务" key="special">
            <Empty description="暂无特殊服务需求数据" />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="旅客详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {selectedPassenger && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="姓名">{selectedPassenger.name}</Descriptions.Item>
              <Descriptions.Item label="性别">{selectedPassenger.gender === 'male' ? '男' : '女'}</Descriptions.Item>
              <Descriptions.Item label="身份证号">{selectedPassenger.idCard}</Descriptions.Item>
              <Descriptions.Item label="护照号">{selectedPassenger.passport || '-'}</Descriptions.Item>
              <Descriptions.Item label="手机号">{selectedPassenger.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedPassenger.email}</Descriptions.Item>
              <Descriptions.Item label="航班号">{selectedPassenger.flightNo}</Descriptions.Item>
              <Descriptions.Item label="舱位">
                {selectedPassenger.seatClass === 'economy' ? '经济舱' : 
                 selectedPassenger.seatClass === 'business' ? '商务舱' : '头等舱'}
              </Descriptions.Item>
              <Descriptions.Item label="座位号">{selectedPassenger.seatNo}</Descriptions.Item>
              <Descriptions.Item label="值机状态">
                <Tag color={checkInColors[selectedPassenger.checkInStatus]}>
                  {checkInLabels[selectedPassenger.checkInStatus]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Card title="出行轨迹" style={{ marginTop: 16 }} size="small">
              <Timeline>
                <Timeline.Item color="green">购票成功 - {selectedPassenger.createdAt}</Timeline.Item>
                {selectedPassenger.checkInStatus !== 'pending' && (
                  <Timeline.Item color="blue">已值机 - {selectedPassenger.boardingTime || '待确认'}</Timeline.Item>
                )}
                {selectedPassenger.boardingStatus && (
                  <Timeline.Item color="blue">已登机</Timeline.Item>
                )}
                <Timeline.Item>等待起飞...</Timeline.Item>
              </Timeline>
            </Card>

            {selectedPassenger.specialService && selectedPassenger.specialService.length > 0 && (
              <Card title="特殊服务" style={{ marginTop: 16 }} size="small">
                <Space>
                  {selectedPassenger.specialService.map((s, i) => (
                    <Tag key={i} color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>
                      <WarningOutlined /> {s}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PassengerService
