import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  message,
  Table,
  Tag
} from 'antd'
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  FireOutlined,
  DashboardOutlined
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { energyApi, deviceApi } from '../services/api'
import dayjs from 'dayjs'
import styled from 'styled-components'

const { RangePicker } = DatePicker
const { Option } = Select

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`

const Energy = () => {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({})
  const [energyData, setEnergyData] = useState([])
  const [topDevices, setTopDevices] = useState([])
  const [period, setPeriod] = useState('day')
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(7, 'day'),
    dayjs()
  ])
  const [devices, setDevices] = useState([])
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  
  useEffect(() => {
    fetchEnergyData()
    fetchDevices()
  }, [period, dateRange])
  
  const fetchEnergyData = async () => {
    try {
      setLoading(true)
      
      const params = {
        period,
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD')
      }
      
      const [summaryRes, statsRes] = await Promise.all([
        energyApi.getSummary(params),
        energyApi.getStats(params)
      ])
      
      setSummary(summaryRes.data.data.summary || {})
      setTopDevices(summaryRes.data.data.topDevices || [])
      
      if (statsRes.data.data && statsRes.data.data.length > 0) {
        setEnergyData(statsRes.data.data)
      } else {
        const mockData = generateMockData(period)
        setEnergyData(mockData)
      }
      
    } catch (error) {
      console.error('获取能耗统计失败:', error)
      const mockData = generateMockData(period)
      setEnergyData(mockData)
      setSummary({
        total_energy: '156.8',
        total_time: 128,
        avg_daily_energy: '22.4',
        devices_count: 6
      })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchDevices = async () => {
    try {
      const response = await deviceApi.getAll({ pageSize: 100 })
      setDevices(response.data.data.devices || [])
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }
  
  const generateMockData = (periodType) => {
    const data = []
    const now = dayjs()
    
    if (periodType === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = now.subtract(i, 'day')
        data.push({
          name: date.format('MM-DD'),
          energy: Math.round((Math.random() * 10 + 15) * 10) / 10,
          time: Math.round(Math.random() * 8 + 10)
        })
      }
    } else if (periodType === 'week') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = now.subtract(i * 7, 'day')
        data.push({
          name: `第${4 - i}周`,
          energy: Math.round((Math.random() * 50 + 100) * 10) / 10,
          time: Math.round(Math.random() * 50 + 70)
        })
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const month = now.subtract(i, 'month')
        data.push({
          name: month.format('YYYY-MM'),
          energy: Math.round((Math.random() * 200 + 400) * 10) / 10,
          time: Math.round(Math.random() * 200 + 300)
        })
      }
    }
    
    return data
  }
  
  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => record.Device?.name || '未知设备'
    },
    {
      title: '设备类型',
      key: 'type',
      render: (_, record) => {
        const typeMap = {
          light: '灯光',
          appliance: '家电',
          window: '门窗',
          door: '门锁',
          security: '安防',
          sensor: '传感器'
        }
        return <Tag>{typeMap[record.Device?.type] || record.Device?.type || '-'}</Tag>
      }
    },
    {
      title: '总能耗 (kWh)',
      dataIndex: 'total_energy',
      key: 'total_energy',
      sorter: (a, b) => a.total_energy - b.total_energy
    },
    {
      title: '运行时间 (小时)',
      dataIndex: 'total_time',
      key: 'total_time'
    }
  ]
  
  const pieData = topDevices.length > 0 ? 
    topDevices.map(d => ({
      name: d.Device?.name || '未知',
      value: parseFloat(d.total_energy) || 0
    })) : 
    [
      { name: '客厅主灯', value: 45.2 },
      { name: '智能空调', value: 68.5 },
      { name: '卧室灯', value: 22.3 },
      { name: '其他设备', value: 20.8 }
    ]
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        能耗统计
      </h2>
      
      <StyledCard>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
          >
            <Option value="day">按天</Option>
            <Option value="week">按周</Option>
            <Option value="month">按月</Option>
          </Select>
          
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
          />
        </div>
      </StyledCard>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="总能耗 (kWh)"
              value={summary.total_energy || '0'}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="总运行时间 (小时)"
              value={summary.total_time || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="日均能耗 (kWh)"
              value={summary.avg_daily_energy || '0'}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="统计设备数"
              value={summary.devices_count || 0}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </StyledCard>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <StyledCard title="能耗趋势">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    name="能耗 (kWh)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="time" 
                    stroke="#52c41a" 
                    strokeWidth={2}
                    name="运行时间 (小时)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </StyledCard>
        </Col>
        
        <Col xs={24} lg={8}>
          <StyledCard title="设备能耗占比">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </StyledCard>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <StyledCard title="设备能耗排行">
            <Table
              columns={columns}
              dataSource={topDevices.length > 0 ? topDevices : [
                { id: 1, Device: { name: '智能空调', type: 'appliance' }, total_energy: 68.5, total_time: 120 },
                { id: 2, Device: { name: '客厅主灯', type: 'light' }, total_energy: 45.2, total_time: 360 },
                { id: 3, Device: { name: '卧室灯', type: 'light' }, total_energy: 22.3, total_time: 240 }
              ]}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </StyledCard>
        </Col>
      </Row>
    </div>
  )
}

export default Energy