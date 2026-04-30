import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Badge,
  Descriptions,
  Drawer,
  Select,
  Empty
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { alertApi } from '../services/api'
import styled from 'styled-components'

const { Option } = Select

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`

const Alerts = () => {
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)
  
  const severityMap = {
    low: { color: 'blue', text: '低' },
    medium: { color: 'gold', text: '中' },
    high: { color: 'orange', text: '高' },
    critical: { color: 'red', text: '严重' }
  }
  
  const typeMap = {
    device_offline: '设备离线',
    device_error: '设备异常',
    security_alert: '安防告警',
    high_energy: '能耗异常',
    system: '系统告警'
  }
  
  useEffect(() => {
    fetchAlerts()
    fetchStats()
  }, [pagination.current, pagination.pageSize, filterStatus])
  
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      
      if (filterStatus === 'unread') {
        params.is_read = false
      } else if (filterStatus === 'unresolved') {
        params.is_resolved = false
      }
      
      const response = await alertApi.getAll(params)
      const data = response.data.data
      setAlerts(data.alerts || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total
      }))
    } catch (error) {
      console.error('获取告警列表失败:', error)
      message.error('获取告警列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchStats = async () => {
    try {
      const response = await alertApi.getStats()
      setStats(response.data.data || {})
    } catch (error) {
      console.error('获取告警统计失败:', error)
    }
  }
  
  const markAsRead = async (id) => {
    try {
      await alertApi.markAsRead(id)
      message.success('已标记为已读')
      fetchAlerts()
      fetchStats()
    } catch (error) {
      message.error('操作失败')
    }
  }
  
  const markAllAsRead = async () => {
    try {
      await alertApi.markAllAsRead()
      message.success('所有告警已标记为已读')
      fetchAlerts()
      fetchStats()
    } catch (error) {
      message.error('操作失败')
    }
  }
  
  const resolveAlert = async (id) => {
    try {
      await alertApi.resolve(id)
      message.success('告警已处理')
      fetchAlerts()
      fetchStats()
    } catch (error) {
      message.error('操作失败')
    }
  }
  
  const openDetailDrawer = (record) => {
    setCurrentAlert(record)
    if (!record.is_read) {
      markAsRead(record.id)
    }
    setDetailDrawerVisible(true)
  }
  
  const columns = [
    {
      title: '告警标题',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Space>
          {!record.is_read && <Badge dot color="#ff4d4f" />}
          <span>{title}</span>
        </Space>
      )
    },
    {
      title: '告警类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      render: (type) => <Tag>{typeMap[type] || type}</Tag>
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const info = severityMap[severity] || { color: 'default', text: severity }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    {
      title: '关联设备',
      key: 'device',
      render: (_, record) => record.Device?.name || '-'
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.is_read ? (
            <Tag>已读</Tag>
          ) : (
            <Tag color="red">未读</Tag>
          )}
          {record.is_resolved ? (
            <Tag color="green">已处理</Tag>
          ) : (
            <Tag color="orange">未处理</Tag>
          )}
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(record)}
          >
            详情
          </Button>
          {!record.is_read && (
            <Button 
              type="link" 
              size="small"
              onClick={() => markAsRead(record.id)}
            >
              标记已读
            </Button>
          )}
          {!record.is_resolved && (
            <Popconfirm
              title="确定要标记为已处理吗？"
              onConfirm={() => resolveAlert(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" icon={<CheckCircleOutlined />}>
                处理
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]
  
  return (
    <div>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        告警中心
      </h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="告警总数"
              value={stats.total || 0}
              prefix={<BellOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="未读告警"
              value={stats.unread || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<Badge count={stats.unread} />}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="未处理告警"
              value={stats.unresolved || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<BellOutlined />}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <div style={{ paddingTop: '8px' }}>
              <Button 
                type="primary" 
                onClick={markAllAsRead}
                disabled={!stats.unread}
                block
              >
                全部标记已读
              </Button>
            </div>
          </StyledCard>
        </Col>
      </Row>
      
      <StyledCard>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            <Option value="all">全部告警</Option>
            <Option value="unread">未读告警</Option>
            <Option value="unresolved">未处理告警</Option>
          </Select>
        </div>
        
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无告警" />
          }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={(page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
        />
      </StyledCard>
      
      <Drawer
        title="告警详情"
        placement="right"
        width={500}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {currentAlert && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="告警标题">{currentAlert.title}</Descriptions.Item>
            <Descriptions.Item label="告警类型">
              {typeMap[currentAlert.alert_type] || currentAlert.alert_type}
            </Descriptions.Item>
            <Descriptions.Item label="严重程度">
              <Tag color={severityMap[currentAlert.severity]?.color || 'default'}>
                {severityMap[currentAlert.severity]?.text || currentAlert.severity}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联设备">
              {currentAlert.Device?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="告警消息">
              {currentAlert.message || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="是否已读">
              {currentAlert.is_read ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item label="是否已处理">
              {currentAlert.is_resolved ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item label="处理时间">
              {currentAlert.resolved_at 
                ? new Date(currentAlert.resolved_at).toLocaleString() 
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentAlert.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Alerts