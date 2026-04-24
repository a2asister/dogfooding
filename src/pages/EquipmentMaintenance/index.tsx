import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, Modal, Form, message, Descriptions, Tabs, Badge, Timeline, Row, Col, Statistic, Alert, Progress, DatePicker } from 'antd'
import { SearchOutlined, EyeOutlined, PlusOutlined, ToolOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { Equipment, MaintenanceRecord, FaultReport } from '@/types'
import { api } from '@/services/api'
import dayjs from 'dayjs'

const { TabPane } = Tabs

const statusColors: Record<string, string> = {
  normal: 'success',
  maintenance: 'warning',
  fault: 'error',
  scrapped: 'default',
}

const statusLabels: Record<string, string> = {
  normal: '正常',
  maintenance: '维护中',
  fault: '故障',
  scrapped: '已报废',
}

const faultSeverityColors: Record<string, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
}

const faultSeverityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
}

const faultStatusColors: Record<string, string> = {
  reported: 'warning',
  assigned: 'processing',
  repairing: 'blue',
  verified: 'green',
  closed: 'default',
}

const faultStatusLabels: Record<string, string> = {
  reported: '已上报',
  assigned: '已指派',
  repairing: '维修中',
  verified: '已核实',
  closed: '已关闭',
}

const maintenanceTypeColors: Record<string, string> = {
  preventive: 'blue',
  corrective: 'green',
  emergency: 'red',
}

const maintenanceTypeLabels: Record<string, string> = {
  preventive: '预防性',
  corrective: '修复性',
  emergency: '紧急',
}

const EquipmentMaintenance: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [faultReports, setFaultReports] = useState<FaultReport[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('equipment')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [equipRes, recordRes, faultRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/maintenance-records'),
        api.get('/fault-reports'),
      ])
      setEquipment(equipRes.data.data.list)
      setMaintenanceRecords(recordRes.data.data.list)
      setFaultReports(faultRes.data.data.list)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: Equipment) => {
    setSelectedEquipment(record)
    setDetailModalVisible(true)
  }

  const handleMaintenance = (record: Equipment) => {
    form.setFieldsValue({
      equipmentId: record.id,
      equipmentName: record.name,
      type: 'preventive',
    })
    setFormModalVisible(true)
  }

  const handleFormSubmit = (_values: Record<string, unknown>) => {
    message.success('维保记录创建成功')
    setFormModalVisible(false)
    form.resetFields()
    fetchData()
  }

  const equipmentColumns = [
    {
      title: '设备编码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: '品牌型号',
      key: 'model',
      render: (_: unknown, record: Equipment) => (
        <div>
          <div>{record.brand}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{record.model}</div>
        </div>
      ),
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
    },
    {
      title: '下次维保',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date: string) => {
        const days = dayjs(date).diff(dayjs(), 'day')
        return (
          <div>
            <div>{date}</div>
            {days <= 7 && days >= 0 && (
              <Tag color="orange" style={{ marginTop: 4 }}>
                <ClockCircleOutlined /> {days}天后到期
              </Tag>
            )}
            {days < 0 && (
              <Tag color="red" style={{ marginTop: 4 }}>
                <ExclamationCircleOutlined /> 已过期
              </Tag>
            )}
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: Equipment) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<ToolOutlined />} onClick={() => handleMaintenance(record)}>
            维保
          </Button>
        </Space>
      ),
    },
  ]

  const maintenanceColumns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: '维保类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={maintenanceTypeColors[type]}>
          {maintenanceTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'success' : 
          status === 'in-progress' ? 'processing' : 
          status === 'scheduled' ? 'default' : 'error'
        }>
          {status === 'completed' ? '已完成' : 
           status === 'in-progress' ? '进行中' : 
           status === 'scheduled' ? '待执行' : '已取消'}
        </Tag>
      ),
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '计划时间',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `¥${cost}`,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small">查看</Button>
      ),
    },
  ]

  const faultColumns = [
    {
      title: '故障编号',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
    },
    {
      title: '故障描述',
      dataIndex: 'faultDescription',
      key: 'faultDescription',
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={faultSeverityColors[severity]}>
          {faultSeverityLabels[severity]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={faultStatusColors[status]}>
          {faultStatusLabels[status]}
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
      dataIndex: 'assignee',
      key: 'assignee',
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
      render: () => (
        <Button type="link" size="small">处理</Button>
      ),
    },
  ]

  const activeFaults = faultReports.filter(f => f.status !== 'closed' && f.status !== 'verified').length
  const overdueMaintenance = equipment.filter(e => dayjs(e.nextMaintenanceDate).diff(dayjs(), 'day') <= 0).length

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="设备总数"
            value={equipment.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="正常运行"
            value={equipment.filter(e => e.status === 'normal').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="待处理故障"
            value={activeFaults}
            valueStyle={{ color: activeFaults > 0 ? '#f5222d' : '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="维保到期"
            value={overdueMaintenance}
            valueStyle={{ color: overdueMaintenance > 0 ? '#faad14' : '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>设备运维</h2>
        <p style={{ margin: 0, color: '#666' }}>设备全生命周期管理、维保计划、故障报修</p>
      </div>

      {(activeFaults > 0 || overdueMaintenance > 0) && (
        <Alert
          message={
            <Space>
              {activeFaults > 0 && (
                <Badge status="error" text={`${activeFaults} 个故障待处理`} />
              )}
              {overdueMaintenance > 0 && (
                <Badge status="warning" text={`${overdueMaintenance} 台设备维保到期`} />
              )}
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setFormModalVisible(true); }}>
              新增维保计划
            </Button>
            <Button icon={<ToolOutlined />}>耗材管理</Button>
            <Button icon={<CheckCircleOutlined />}>统计报表</Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="设备台账" key="equipment">
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Input
                  placeholder="搜索设备编码/名称"
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                />
                <Select placeholder="设备状态" style={{ width: 150 }} allowClear>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
                <Select placeholder="设备类别" style={{ width: 150 }} allowClear>
                  {[...new Set(equipment.map(e => e.category))].map(cat => (
                    <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                  ))}
                </Select>
                <Button type="primary" icon={<SearchOutlined />}>查询</Button>
              </Space>
            </div>
            <Table
              columns={equipmentColumns}
              dataSource={equipment}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              scroll={{ x: 1400 }}
            />
          </TabPane>
          <TabPane tab="维保记录" key="maintenance">
            <Table
              columns={maintenanceColumns}
              dataSource={maintenanceRecords}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                故障报修
                {activeFaults > 0 && <Badge count={activeFaults} style={{ marginLeft: 4 }} />}
              </span>
            } 
            key="faults"
          >
            <Table
              columns={faultColumns}
              dataSource={faultReports}
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
        title="设备详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
          <Button key="maintain" type="primary" icon={<ToolOutlined />}>
            创建维保
          </Button>,
        ]}
      >
        {selectedEquipment && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="设备编码">{selectedEquipment.code}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{selectedEquipment.name}</Descriptions.Item>
              <Descriptions.Item label="设备类别">{selectedEquipment.category}</Descriptions.Item>
              <Descriptions.Item label="品牌">{selectedEquipment.brand}</Descriptions.Item>
              <Descriptions.Item label="型号">{selectedEquipment.model}</Descriptions.Item>
              <Descriptions.Item label="序列号">{selectedEquipment.serialNumber}</Descriptions.Item>
              <Descriptions.Item label="购买日期">{selectedEquipment.purchaseDate}</Descriptions.Item>
              <Descriptions.Item label="保修期到">{selectedEquipment.warrantyExpiry}</Descriptions.Item>
              <Descriptions.Item label="存放位置">{selectedEquipment.location}</Descriptions.Item>
              <Descriptions.Item label="责任人">{selectedEquipment.responsiblePerson}</Descriptions.Item>
              <Descriptions.Item label="设备状态">
                <Tag color={statusColors[selectedEquipment.status]}>
                  {statusLabels[selectedEquipment.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="故障次数">{selectedEquipment.faultCount} 次</Descriptions.Item>
              <Descriptions.Item label="上次维保">{selectedEquipment.lastMaintenanceDate}</Descriptions.Item>
              <Descriptions.Item label="下次维保">
                <div>
                  {selectedEquipment.nextMaintenanceDate}
                  {dayjs(selectedEquipment.nextMaintenanceDate).diff(dayjs(), 'day') <= 7 && (
                    <Tag color="warning" style={{ marginLeft: 8 }}>即将到期</Tag>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Card title="维保周期" style={{ marginTop: 16 }} size="small">
              <Progress 
                percent={Math.round((dayjs().diff(selectedEquipment.lastMaintenanceDate, 'day') / selectedEquipment.maintenanceCycle) * 100)} 
                format={(percent) => `维保进度: ${percent}%`}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#999' }}>上次维保: {selectedEquipment.lastMaintenanceDate}</span>
                <span style={{ color: '#999' }}>周期: {selectedEquipment.maintenanceCycle} 天</span>
                <span style={{ color: '#999' }}>下次维保: {selectedEquipment.nextMaintenanceDate}</span>
              </div>
            </Card>

            <Card title="历史维保记录" style={{ marginTop: 16 }} size="small">
              <Timeline>
                <Timeline.Item color="green">
                  <strong>预防性维保</strong>
                  <div style={{ color: '#999', fontSize: 12 }}>2024-03-15 09:00 - 正常完成</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <strong>修复性维保</strong>
                  <div style={{ color: '#999', fontSize: 12 }}>2024-02-20 14:30 - 更换损坏部件</div>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <strong>预防性维保</strong>
                  <div style={{ color: '#999', fontSize: 12 }}>2024-01-10 10:00 - 正常完成</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="新增维保计划"
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="equipmentId"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="请选择设备">
              {equipment.map(e => (
                <Select.Option key={e.id} value={e.id}>{e.name} ({e.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="维保类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select>
                  {Object.entries(maintenanceTypeLabels).map(([key, label]) => (
                    <Select.Option key={key} value={key}>{label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scheduledTime"
                label="计划时间"
                rules={[{ required: true, message: '请选择时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="operator"
            label="操作人"
            rules={[{ required: true, message: '请输入操作人' }]}
          >
            <Input placeholder="请输入操作人姓名" />
          </Form.Item>
          <Form.Item
            name="description"
            label="维保内容"
            rules={[{ required: true, message: '请输入维保内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述维保内容" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setFormModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">确认创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EquipmentMaintenance
