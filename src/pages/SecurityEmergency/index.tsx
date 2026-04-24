import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Modal, message, Descriptions, Tabs, Badge, Row, Col, Statistic, Alert, Popconfirm, Steps } from 'antd'
import { SearchOutlined, EyeOutlined, PlusOutlined, WarningOutlined, SafetyCertificateOutlined, PlayCircleOutlined } from '@ant-design/icons'
import type { SecurityCheck, HiddenDanger, EmergencyPlan, EmergencyIncident } from '@/types'
import { api } from '@/services/api'

const { TabPane } = Tabs
const { Step } = Steps

const levelColors: Record<string, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
}

const levelLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
}

const dangerStatusColors: Record<string, string> = {
  reported: 'warning',
  assigned: 'processing',
  processing: 'blue',
  verified: 'green',
  closed: 'default',
}

const dangerStatusLabels: Record<string, string> = {
  reported: '已上报',
  assigned: '已指派',
  processing: '处理中',
  verified: '已核实',
  closed: '已关闭',
}

const incidentStatusColors: Record<string, string> = {
  triggered: 'red',
  handling: 'orange',
  resolved: 'green',
  closed: 'default',
}

const incidentStatusLabels: Record<string, string> = {
  triggered: '已触发',
  handling: '处置中',
  resolved: '已解决',
  closed: '已归档',
}

const planTypeLabels: Record<string, string> = {
  fire: '火灾',
  medical: '医疗',
  security: '安防',
  natural: '自然灾害',
  other: '其他',
}

const SecurityEmergency: React.FC = () => {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([])
  const [hiddenDangers, setHiddenDangers] = useState<HiddenDanger[]>([])
  const [emergencyPlans, setEmergencyPlans] = useState<EmergencyPlan[]>([])
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('checks')
  const [selectedItem, setSelectedItem] = useState<HiddenDanger | EmergencyIncident | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [planModalVisible, setPlanModalVisible] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [checksRes, dangersRes, plansRes, incidentsRes] = await Promise.all([
        api.get('/security-checks'),
        api.get('/hidden-dangers'),
        api.get('/emergency-plans'),
        api.get('/emergency-incidents'),
      ])
      setSecurityChecks(checksRes.data.data.list)
      setHiddenDangers(dangersRes.data.data.list)
      setEmergencyPlans(plansRes.data.data.list)
      setEmergencyIncidents(incidentsRes.data.data.list)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = (_record: SecurityCheck) => {
    message.success('巡检打卡成功')
    fetchData()
  }

  const handleDangerDetail = (record: HiddenDanger) => {
    setSelectedItem(record)
    setDetailModalVisible(true)
  }

  const handleIncidentDetail = (record: EmergencyIncident) => {
    setSelectedItem(record)
    setDetailModalVisible(true)
  }

  const handleTriggerPlan = (plan: EmergencyPlan) => {
    Modal.confirm({
      title: '触发应急预案',
      icon: <WarningOutlined style={{ color: '#f5222d' }} />,
      content: (
        <div>
          <p>确定要触发 <strong>{plan.name}</strong> 吗？</p>
          <p style={{ color: '#f5222d' }}>此操作将立即通知所有相关人员！</p>
        </div>
      ),
      okText: '确认触发',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('应急预案已触发，相关人员已收到通知')
      },
    })
  }

  const checkColumns = [
    {
      title: '巡检区域',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '检查项目',
      dataIndex: 'checkItem',
      key: 'checkItem',
    },
    {
      title: '检查员',
      dataIndex: 'inspector',
      key: 'inspector',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'success' : 
          status === 'in-progress' ? 'processing' : 
          status === 'failed' ? 'error' : 'default'
        }>
          {status === 'completed' ? '已完成' : 
           status === 'in-progress' ? '进行中' : 
           status === 'failed' ? '不合格' : '待开始'}
        </Tag>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '发现问题',
      dataIndex: 'findings',
      key: 'findings',
      render: (findings: string[]) => (
        findings && findings.length > 0 ? (
          <Tag color="red">{findings.length} 项</Tag>
        ) : (
          <span style={{ color: '#999' }}>无</span>
        )
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: SecurityCheck) => (
        <Space>
          {record.status === 'pending' && (
            <Button type="primary" size="small" onClick={() => handleCheckIn(record)}>
              开始巡检
            </Button>
          )}
          {record.status === 'in-progress' && (
            <Button size="small" type="primary" ghost>
              继续巡检
            </Button>
          )}
          <Button type="link" size="small">查看</Button>
        </Space>
      ),
    },
  ]

  const dangerColumns = [
    {
      title: '隐患标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '区域',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={levelColors[level]}>
          {levelLabels[level]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={dangerStatusColors[status]}>
          {dangerStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      key: 'reporter',
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      render: (text: string) => text || '未分配',
    },
    {
      title: '上报时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: HiddenDanger) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleDangerDetail(record)}>详情</Button>
          <Button type="link" size="small">处理</Button>
        </Space>
      ),
    },
  ]

  const incidentColumns = [
    {
      title: '事件标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '预案名称',
      dataIndex: 'planName',
      key: 'planName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={levelColors[level.replace('level', '') as 'low']}>
          {levelLabels[level.replace('level', '') as 'low']}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={incidentStatusColors[status]}>
          {incidentStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '指挥官',
      dataIndex: 'commander',
      key: 'commander',
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EmergencyIncident) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleIncidentDetail(record)}>详情</Button>
          {record.status === 'triggered' || record.status === 'handling' ? (
            <Button type="primary" size="small" danger>
              更新进度
            </Button>
          ) : null}
        </Space>
      ),
    },
  ]

  const activeIncidents = emergencyIncidents.filter(i => i.status === 'triggered' || i.status === 'handling').length

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="今日巡检任务"
            value={securityChecks.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="待处理隐患"
            value={hiddenDangers.filter(d => d.status !== 'closed' && d.status !== 'verified').length}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="活跃应急事件"
            value={activeIncidents}
            valueStyle={{ color: activeIncidents > 0 ? '#f5222d' : '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="应急预案"
            value={emergencyPlans.length}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>安防应急</h2>
            <p style={{ margin: 0, color: '#666' }}>安全巡检、隐患排查、应急预案管理</p>
          </Col>
          <Col>
            {activeIncidents > 0 && (
              <Alert
                message={`当前有 ${activeIncidents} 个应急事件正在处置`}
                type="error"
                showIcon
                action={
                  <Button size="small" danger onClick={() => setActiveTab('incidents')}>
                    立即查看
                  </Button>
                }
              />
            )}
          </Col>
        </Row>
      </div>

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>新建巡检任务</Button>
            <Button icon={<SafetyCertificateOutlined />} onClick={() => setPlanModalVisible(true)}>
              应急预案库
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="安全巡检" key="checks">
            <Table
              columns={checkColumns}
              dataSource={securityChecks}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="隐患排查" key="dangers">
            <Table
              columns={dangerColumns}
              dataSource={hiddenDangers}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                应急事件
                {activeIncidents > 0 && <Badge count={activeIncidents} style={{ marginLeft: 4 }} />}
              </span>
            } 
            key="incidents"
          >
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" danger icon={<WarningOutlined />}>
                一键触发预案
              </Button>
            </div>
            <Table
              columns={incidentColumns}
              dataSource={emergencyIncidents}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="隐患详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="process" type="primary">处理</Button>,
        ]}
      >
        {selectedItem && 'reporter' in selectedItem && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="隐患标题">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="区域">{selectedItem.area}</Descriptions.Item>
              <Descriptions.Item label="等级">
                <Tag color={levelColors[selectedItem.level]}>
                  {levelLabels[selectedItem.level]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={dangerStatusColors[selectedItem.status]}>
                  {dangerStatusLabels[selectedItem.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="上报人">{selectedItem.reporter}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedItem.reporterPhone}</Descriptions.Item>
              <Descriptions.Item label="处理人">{selectedItem.handler || '未分配'}</Descriptions.Item>
              <Descriptions.Item label="上报时间">{selectedItem.createdAt}</Descriptions.Item>
            </Descriptions>

            <Card title="隐患描述" style={{ marginTop: 16 }} size="small">
              <p>{selectedItem.description}</p>
            </Card>

            <Card title="处理进度" style={{ marginTop: 16 }} size="small">
              <Steps direction="vertical" current={2}>
                <Step title="上报" description={selectedItem.createdAt} status="finish" />
                <Step title="指派" description={selectedItem.assignedAt || '待指派'} status={selectedItem.assignedAt ? 'finish' : 'process'} />
                <Step title="处理" description="处理中" status="process" />
                <Step title="核实" status="wait" />
                <Step title="关闭" status="wait" />
              </Steps>
            </Card>

            {selectedItem.comments && selectedItem.comments.length > 0 && (
              <Card title="处理记录" style={{ marginTop: 16 }} size="small">
                {selectedItem.comments.map((comment, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{comment.user}</strong>
                      <span style={{ color: '#999' }}>{comment.createdAt}</span>
                    </div>
                    <p style={{ margin: 8, color: '#666' }}>{comment.content}</p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="应急预案库"
        open={planModalVisible}
        onCancel={() => setPlanModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPlanModalVisible(false)}>关闭</Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="搜索预案名称" prefix={<SearchOutlined />} style={{ width: 300 }} />
        </div>
        {emergencyPlans.map((plan) => (
          <Card
            key={plan.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={
              <Space>
                <SafetyCertificateOutlined />
                <span>{plan.name}</span>
                <Tag color={plan.type === 'fire' ? 'red' : plan.type === 'medical' ? 'blue' : 'orange'}>
                  {planTypeLabels[plan.type]}
                </Tag>
                {plan.isActive && <Tag color="green">启用</Tag>}
              </Space>
            }
            extra={
              <Space>
                <Button size="small" icon={<EyeOutlined />}>查看</Button>
                <Popconfirm
                  title={`确定要触发 ${plan.name} 吗？`}
                  onConfirm={() => { handleTriggerPlan(plan); setPlanModalVisible(false); }}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="primary" danger size="small" icon={<PlayCircleOutlined />}>
                    触发
                  </Button>
                </Popconfirm>
              </Space>
            }
          >
            <p>{plan.description}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <span style={{ color: '#999' }}>触发条件：</span>
                {plan.triggerConditions.map((t, i) => (
                  <Tag key={i} style={{ marginLeft: 4 }}>{t}</Tag>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#999' }}>响应团队：</span>
              {plan.responseTeams.map((t, i) => (
                <Tag key={i} color="blue" style={{ marginLeft: 4 }}>{t}</Tag>
              ))}
            </div>
          </Card>
        ))}
      </Modal>
    </div>
  )
}

export default SecurityEmergency
