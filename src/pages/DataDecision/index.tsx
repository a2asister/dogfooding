import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Button, Space, Select, DatePicker, Table, Tag, Tabs } from 'antd'
import {
  RocketOutlined,
  UserOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Line,
  Column,
  Pie,
  Gauge,
  Area,
} from '@ant-design/charts'
import type { Statistics } from '@/types'
import { api } from '@/services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { TabPane } = Tabs

const DataDecision: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/statistics')
      setStatistics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const flightTrendData = [
    { date: '04-18', total: 420, normal: 380, delay: 35, cancel: 5 },
    { date: '04-19', total: 445, normal: 410, delay: 30, cancel: 5 },
    { date: '04-20', total: 415, normal: 375, delay: 35, cancel: 5 },
    { date: '04-21', total: 450, normal: 420, delay: 25, cancel: 5 },
    { date: '04-22', total: 430, normal: 395, delay: 30, cancel: 5 },
    { date: '04-23', total: 460, normal: 430, delay: 25, cancel: 5 },
    { date: '04-24', total: 440, normal: 405, delay: 30, cancel: 5 },
  ]

  const passengerTrendData = [
    { date: '04-18', domestic: 35000, international: 8000, transit: 5000 },
    { date: '04-19', domestic: 38000, international: 9000, transit: 6000 },
    { date: '04-20', domestic: 32000, international: 7000, transit: 4500 },
    { date: '04-21', domestic: 40000, international: 10000, transit: 7000 },
    { date: '04-22', domestic: 36000, international: 8500, transit: 5500 },
    { date: '04-23', domestic: 42000, international: 11000, transit: 7500 },
    { date: '04-24', domestic: 39000, international: 9500, transit: 6500 },
  ]

  const airlineDistributionData = [
    { type: '国航', value: 25 },
    { type: '东航', value: 20 },
    { type: '南航', value: 18 },
    { type: '海航', value: 15 },
    { type: '其他', value: 22 },
  ]

  const hourlyData = []
  for (let i = 0; i < 24; i++) {
    hourlyData.push({
      hour: `${String(i).padStart(2, '0')}:00`,
      departures: Math.floor(Math.random() * 30) + 10,
      arrivals: Math.floor(Math.random() * 30) + 10,
    })
  }

  const complaintData = [
    { type: '服务问题', value: 35 },
    { type: '行李问题', value: 25 },
    { type: '设施问题', value: 20 },
    { type: '员工问题', value: 10 },
    { type: '其他', value: 10 },
  ]

  const onTimeRate = statistics ? Math.round((statistics.onTimeFlights / statistics.totalFlights) * 100) : 85

  const stats = (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="今日航班总数"
            value={statistics?.totalFlights || 440}
            prefix={<RocketOutlined style={{ color: '#1890ff' }} />}
            suffix="架次"
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="航班准点率"
            value={onTimeRate}
            suffix="%"
            valueStyle={{ color: onTimeRate >= 90 ? '#52c41a' : '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="今日旅客吞吐量"
            value={statistics?.totalPassengers || 55000}
            prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            suffix="人次"
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small" hoverable>
          <Statistic
            title="待处理告警"
            value={(statistics?.activeEmergencies || 0) + (statistics?.equipmentFaults || 0)}
            prefix={<WarningOutlined style={{ color: '#f5222d' }} />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  )

  const lineConfig = {
    data: flightTrendData,
    xField: 'date',
    yField: 'total',
    seriesField: 'type',
    point: { size: 5, shape: 'diamond' },
    label: {
      style: { fill: '#aaa' },
    },
  }

  const columnConfig = {
    data: passengerTrendData,
    xField: 'date',
    yField: 'domestic',
    seriesField: 'type',
    isStack: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  }

  const pieConfig = {
    appendPadding: 10,
    data: airlineDistributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
  }

  const gaugeConfig = {
    percent: onTimeRate / 100,
    range: { color: ['#f5222d', '#faad14', '#52c41a'] },
    indicator: {
      pointer: { style: { stroke: '#1890ff' } },
      pin: { style: { stroke: '#1890ff' } },
    },
    statistic: {
      title: {
        offsetY: -120,
        style: {
          fontSize: 24,
          fill: '#999',
        },
      },
      content: {
        style: {
          fontSize: 36,
          fill: '#1890ff',
          fontWeight: 'bold',
        },
      },
    },
  }

  const areaConfig = {
    data: hourlyData,
    xField: 'hour',
    yField: 'departures',
    xAxis: { tickCount: 12 },
    areaStyle: { fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff' },
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>数据决策中心</h2>
          <p style={{ margin: 0, color: '#666' }}>
            实时监控机场运营指标，支持多维度数据分析与报表导出
          </p>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          />
          <Select defaultValue="today" style={{ width: 120 }}>
            <Select.Option value="today">今日</Select.Option>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchStatistics}>
            刷新
          </Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            导出报表
          </Button>
        </Space>
      </div>

      {stats}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="航班运行趋势（近7天）"
            extra={
              <Button type="link" size="small">
                详情
              </Button>
            }
          >
            <Line
              {...lineConfig}
              data={flightTrendData}
              xField="date"
              yField="total"
              seriesField="type"
              tooltip={{
                shared: true,
                showMarkers: false,
              }}
              interactions={[{ type: 'active-region' }]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="航班准点率">
            <Gauge
              {...gaugeConfig}
              statistic={{
                title: {
                  formatter: () => '准点率',
                },
                content: {
                  formatter: () => `${onTimeRate}%`,
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="旅客吞吐量趋势（近7天）">
            <Column
              {...columnConfig}
              data={passengerTrendData}
              xField="date"
              yField="domestic"
              seriesField="type"
              isStack={true}
              xAxis={{ label: { autoHide: true, autoRotate: false } }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="航空公司运力分布">
            <Pie
              {...pieConfig}
              data={airlineDistributionData}
              angleField="value"
              colorField="type"
              legend={{
                position: 'right',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="今日航班小时分布">
            <Area
              {...areaConfig}
              data={hourlyData}
              xField="hour"
              yField="departures"
              tooltip={{ shared: true }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="投诉类型分布">
            <Pie
              data={complaintData}
              angleField="value"
              colorField="type"
              radius={0.9}
              innerRadius={0.6}
              statistic={{
                title: {
                  formatter: () => '投诉统计',
                },
                content: {
                  formatter: () => '60 起',
                },
              }}
              legend={{ position: 'bottom' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="核心指标详情" style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="航班运营" key="1">
            <Table
              dataSource={[
                { key: '1', name: '总航班数', today: '440', yesterday: '425', week: '3080', trend: '+3.5%' },
                { key: '2', name: '准点航班', today: '374', yesterday: '361', week: '2618', trend: '+2.3%' },
                { key: '3', name: '延误航班', today: '55', yesterday: '52', week: '385', trend: '+5.7%' },
                { key: '4', name: '取消航班', today: '11', yesterday: '12', week: '77', trend: '-8.3%' },
                { key: '5', name: '国际航班', today: '95', yesterday: '88', week: '665', trend: '+8.0%' },
                { key: '6', name: '国内航班', today: '345', yesterday: '337', week: '2415', trend: '+2.4%' },
              ]}
              columns={[
                { title: '指标名称', dataIndex: 'name', key: 'name', render: (text: string) => <strong>{text}</strong> },
                { title: '今日', dataIndex: 'today', key: 'today' },
                { title: '昨日', dataIndex: 'yesterday', key: 'yesterday' },
                { title: '本周', dataIndex: 'week', key: 'week' },
                { title: '同比趋势', dataIndex: 'trend', key: 'trend', render: (text: string) => (
                  <Tag color={text.startsWith('+') ? 'green' : 'red'}>
                    {text.startsWith('+') ? '↑' : '↓'} {text}
                  </Tag>
                )},
              ]}
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab="旅客服务" key="2">
            <Table
              dataSource={[
                { key: '1', name: '旅客总数', today: '55,000', yesterday: '52,800', week: '385,000', trend: '+4.2%' },
                { key: '2', name: '国内旅客', today: '43,500', yesterday: '41,800', week: '305,500', trend: '+4.1%' },
                { key: '3', name: '国际旅客', today: '11,500', yesterday: '11,000', week: '79,500', trend: '+4.5%' },
                { key: '4', name: '中转旅客', today: '8,250', yesterday: '7,920', week: '57,750', trend: '+4.2%' },
                { key: '5', name: '值机率', today: '92.5%', yesterday: '91.8%', week: '92.0%', trend: '+0.8%' },
                { key: '6', name: '投诉数量', today: '8', yesterday: '12', week: '60', trend: '-33.3%' },
              ]}
              columns={[
                { title: '指标名称', dataIndex: 'name', key: 'name', render: (text: string) => <strong>{text}</strong> },
                { title: '今日', dataIndex: 'today', key: 'today' },
                { title: '昨日', dataIndex: 'yesterday', key: 'yesterday' },
                { title: '本周', dataIndex: 'week', key: 'week' },
                { title: '同比趋势', dataIndex: 'trend', key: 'trend', render: (text: string) => (
                  <Tag color={text.startsWith('+') ? 'green' : 'red'}>
                    {text.startsWith('+') ? '↑' : '↓'} {text}
                  </Tag>
                )},
              ]}
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab="资源利用" key="3">
            <Table
              dataSource={[
                { key: '1', name: '登机口利用率', today: '85%', yesterday: '82%', week: '83%', trend: '+3.7%' },
                { key: '2', name: '停机位利用率', today: '78%', yesterday: '76%', week: '77%', trend: '+2.6%' },
                { key: '3', name: '廊桥利用率', today: '92%', yesterday: '90%', week: '91%', trend: '+2.2%' },
                { key: '4', name: '行李分拣效率', today: '96%', yesterday: '95%', week: '95.5%', trend: '+1.1%' },
                { key: '5', name: '设备完好率', today: '97.5%', yesterday: '97.2%', week: '97.3%', trend: '+0.3%' },
                { key: '6', name: '安检通过率', today: '98.2%', yesterday: '98.0%', week: '98.1%', trend: '+0.2%' },
              ]}
              columns={[
                { title: '指标名称', dataIndex: 'name', key: 'name', render: (text: string) => <strong>{text}</strong> },
                { title: '今日', dataIndex: 'today', key: 'today' },
                { title: '昨日', dataIndex: 'yesterday', key: 'yesterday' },
                { title: '本周', dataIndex: 'week', key: 'week' },
                { title: '同比趋势', dataIndex: 'trend', key: 'trend', render: (text: string) => (
                  <Tag color={text.startsWith('+') ? 'green' : 'red'}>
                    {text.startsWith('+') ? '↑' : '↓'} {text}
                  </Tag>
                )},
              ]}
              pagination={false}
              size="small"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default DataDecision
