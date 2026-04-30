import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Button,
  Tag,
  Space,
  message,
  Spin
} from 'antd'
import {
  BulbOutlined,
  AppstoreOutlined,
  BellOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  FireOutlined
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { deviceApi, sceneApi, alertApi, energyApi } from '../services/api'
import styled from 'styled-components'

const StyledCard = styled(Card)`
  height: 100%;
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`

const SceneCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .scene-icon {
    font-size: 32px;
    margin-bottom: 8px;
    color: #1890ff;
  }
`

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [deviceStats, setDeviceStats] = useState({})
  const [alertStats, setAlertStats] = useState({})
  const [recentAlerts, setRecentAlerts] = useState([])
  const [scenes, setScenes] = useState([])
  const [energyData, setEnergyData] = useState([])
  const [deviceTypeData, setDeviceTypeData] = useState([])
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [deviceRes, alertRes, scenesRes, energyRes] = await Promise.all([
        deviceApi.getStats(),
        alertApi.getStats(),
        sceneApi.getAll({ pageSize: 8 }),
        energyApi.getSummary()
      ])
      
      setDeviceStats(deviceRes.data.data)
      setAlertStats(alertRes.data.data)
      setScenes(scenesRes.data.data.scenes || [])
      
      if (deviceRes.data.data.byType) {
        setDeviceTypeData(
          deviceRes.data.data.byType.map(item => ({
            name: getDeviceTypeName(item.type),
            value: item.count
          }))
        )
      }
      
      const mockEnergyData = [
        { name: '周一', energy: 4.2 },
        { name: '周二', energy: 5.1 },
        { name: '周三', energy: 3.8 },
        { name: '周四', energy: 6.2 },
        { name: '周五', energy: 5.5 },
        { name: '周六', energy: 7.1 },
        { name: '周日', energy: 6.8 }
      ]
      setEnergyData(mockEnergyData)
      
      const alertsRes = await alertApi.getAll({ pageSize: 5 })
      setRecentAlerts(alertsRes.data.data.alerts || [])
      
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }
  
  const getDeviceTypeName = (type) => {
    const typeMap = {
      light: '灯光',
      appliance: '家电',
      window: '门窗',
      door: '门锁',
      security: '安防',
      sensor: '传感器'
    }
    return typeMap[type] || type
  }
  
  const getSeverityColor = (severity) => {
    const colorMap = {
      low: 'blue',
      medium: 'gold',
      high: 'orange',
      critical: 'red'
    }
    return colorMap[severity] || 'default'
  }
  
  const executeScene = async (scene) => {
    try {
      message.loading({ content: '正在执行场景...', key: 'execute' })
      await sceneApi.execute(scene.id)
      message.success({ content: `场景 "${scene.name}" 执行成功`, key: 'execute' })
    } catch (error) {
      message.error({ content: '场景执行失败', key: 'execute' })
    }
  }
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        监控面板
      </h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="总设备数"
              value={deviceStats.total || 0}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="在线设备"
              value={deviceStats.online || 0}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="未处理告警"
              value={alertStats.unresolved || 0}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="今日能耗 (kWh)"
              value={5.2}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </StyledCard>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <StyledCard title="能耗趋势">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    name="能耗 (kWh)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </StyledCard>
        </Col>
        
        <Col xs={24} lg={8}>
          <StyledCard title="设备类型分布">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceTypeData.map((entry, index) => (
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
        <Col xs={24} lg={12}>
          <StyledCard title="快捷场景">
            <Row gutter={[16, 16]}>
              {scenes.slice(0, 4).map(scene => (
                <Col xs={12} key={scene.id}>
                  <SceneCard
                    onClick={() => executeScene(scene)}
                    cover={
                      <div style={{ padding: '24px 0', textAlign: 'center' }}>
                        <AppstoreOutlined className="scene-icon" />
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>{scene.name}</div>
                      </div>
                    }
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          executeScene(scene)
                        }}
                      >
                        执行
                      </Button>
                    </div>
                  </SceneCard>
                </Col>
              ))}
            </Row>
          </StyledCard>
        </Col>
        
        <Col xs={24} lg={12}>
          <StyledCard 
            title="最近告警"
            extra={<Button type="link" onClick={() => window.location.href = '/alerts'}>查看全部</Button>}
          >
            <List
              dataSource={recentAlerts}
              renderItem={(alert) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={getSeverityColor(alert.severity)}>
                        {alert.severity === 'critical' ? '严重' : 
                         alert.severity === 'high' ? '高' : 
                         alert.severity === 'medium' ? '中' : '低'}
                      </Tag>
                    }
                    title={alert.title}
                    description={
                      <Space>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                        {!alert.is_read && <Tag color="red">未读</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </StyledCard>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard