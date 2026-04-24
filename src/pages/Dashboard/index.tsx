import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Space, Button, Badge, Progress } from 'antd'
import {
  RocketOutlined,
  UserOutlined,
  SnippetsOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import type { Statistics, Flight } from '@/types'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'

const statusColors: Record<string, string> = {
  scheduled: 'default',
  delayed: 'warning',
  cancelled: 'error',
  diverted: 'processing',
  boarding: 'success',
  departed: 'blue',
  arrived: 'green',
}

const statusLabels: Record<string, string> = {
  scheduled: '计划中',
  delayed: '延误',
  cancelled: '取消',
  diverted: '备降',
  boarding: '登机中',
  departed: '已起飞',
  arrived: '已到达',
}

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStatistics()
    fetchFlights()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const response = await api.get('/statistics')
      setStatistics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFlights = async () => {
    try {
      const response = await api.get('/flights?pageSize=10')
      setFlights(response.data.data.list.slice(0, 10))
    } catch (error) {
      console.error('Failed to fetch flights:', error)
    }
  }

  const columns = [
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '航空公司',
      dataIndex: 'airline',
      key: 'airline',
    },
    {
      title: '航线',
      key: 'route',
      render: (_: unknown, record: Flight) => (
        <span>
          {record.departureAirport} → {record.arrivalAirport}
        </span>
      ),
    },
    {
      title: '计划时间',
      key: 'schedule',
      render: (_: unknown, record: Flight) => (
        <span>
          {record.scheduledDeparture.split(' ')[1]} - {record.scheduledArrival.split(' ')[1]}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
        </Space>
      ),
    },
  ]

  const warningList = [
    {
      key: '1',
      title: '航班 MU5102 延误 45 分钟',
      type: 'delay',
      time: '10分钟前',
    },
    {
      key: '2',
      title: '旅客行李异常（损坏）需处理',
      type: 'baggage',
      time: '15分钟前',
    },
    {
      key: '3',
      title: '登机口 G12 设备故障报修',
      type: 'equipment',
      time: '30分钟前',
    },
    {
      key: '4',
      title: 'T2 航站楼安全检查发现隐患',
      type: 'security',
      time: '1小时前',
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>运营概览</h2>
        <p style={{ margin: 0, color: '#666' }}>实时监控机场核心运营指标</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/flight')}>
            <Statistic
              title="今日航班总数"
              value={statistics?.totalFlights || 0}
              prefix={<RocketOutlined style={{ color: '#1890ff' }} />}
              suffix="架次"
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#52c41a' }}>
                <CheckCircleOutlined /> 准点: {statistics?.onTimeFlights || 0}
              </span>
              <span style={{ color: '#faad14' }}>
                <WarningOutlined /> 延误: {statistics?.delayedFlights || 0}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/passenger')}>
            <Statistic
              title="今日旅客总量"
              value={statistics?.totalPassengers || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              suffix="人次"
            />
            <div style={{ marginTop: 16 }}>
              <Progress
                percent={Math.round(((statistics?.checkedPassengers || 0) / (statistics?.totalPassengers || 1)) * 100)}
                format={(percent) => `已值机: ${percent}%`}
                size="small"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/baggage')}>
            <Statistic
              title="今日行李总量"
              value={statistics?.totalBaggage || 0}
              prefix={<SnippetsOutlined style={{ color: '#722ed1' }} />}
              suffix="件"
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#52c41a' }}>正常</span>
              <span style={{ color: '#f5222d' }}>
                <ExclamationCircleOutlined /> 异常: {statistics?.abnormalBaggage || 0}
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/security')}>
            <Statistic
              title="待处理告警"
              value={(statistics?.activeEmergencies || 0) + (statistics?.equipmentFaults || 0)}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#f5222d' }}>
                <Badge status="error" /> 安全事件: {statistics?.securityIncidents || 0}
              </span>
              <span style={{ color: '#faad14' }}>
                <Badge status="warning" /> 设备故障: {statistics?.equipmentFaults || 0}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <RocketOutlined />
                <span>实时航班动态</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/flight')}>
                查看全部
              </Button>
            }
            loading={loading}
          >
            <Table
              columns={columns}
              dataSource={flights}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <SyncOutlined spin />
                <span>实时告警事件</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {warningList.map((item) => (
                <Card
                  key={item.key}
                  size="small"
                  hoverable
                  style={{
                    borderLeft: `4px solid ${
                      item.type === 'delay'
                        ? '#faad14'
                        : item.type === 'security'
                        ? '#f5222d'
                        : '#1890ff'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14 }}>{item.title}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>{item.time}</span>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          <Card
            title={
              <Space>
                <ScheduleOutlined />
                <span>资源利用率</span>
              </Space>
            }
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>登机口利用率</span>
                  <span style={{ fontWeight: 'bold' }}>{statistics?.resourceUtilization.gate || 0}%</span>
                </div>
                <Progress percent={statistics?.resourceUtilization.gate || 0} status="active" />
              </div>
              <div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>停机位利用率</span>
                  <span style={{ fontWeight: 'bold' }}>{statistics?.resourceUtilization.stand || 0}%</span>
                </div>
                <Progress percent={statistics?.resourceUtilization.stand || 0} status="active" />
              </div>
              <div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>廊桥利用率</span>
                  <span style={{ fontWeight: 'bold' }}>{statistics?.resourceUtilization.bridge || 0}%</span>
                </div>
                <Progress percent={statistics?.resourceUtilization.bridge || 0} status="active" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
