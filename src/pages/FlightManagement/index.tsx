import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, DatePicker, Modal, Form, message, Popconfirm, Badge, Descriptions, Timeline, Row, Col } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ImportOutlined, ExportOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons'
import type { Flight } from '@/types'
import { api } from '@/services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

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

interface SearchParams {
  keyword: string
  status: string
  date: [dayjs.Dayjs | null, dayjs.Dayjs | null] | []
}

const FlightManagement: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    status: '',
    date: [],
  })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchFlights()
  }, [])

  const fetchFlights = async () => {
    setLoading(true)
    try {
      const response = await api.get('/flights')
      setFlights(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch flights:', error)
      message.error('获取航班数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: Flight) => {
    setSelectedFlight(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: Flight) => {
    form.setFieldsValue({
      ...record,
      scheduledDeparture: dayjs(record.scheduledDeparture),
      scheduledArrival: dayjs(record.scheduledArrival),
    })
    setSelectedFlight(record)
    setFormModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    message.success('删除成功')
    fetchFlights()
  }

  const handleFormSubmit = (_values: Record<string, unknown>) => {
    message.success(selectedFlight ? '更新成功' : '创建成功')
    setFormModalVisible(false)
    form.resetFields()
    fetchFlights()
  }

  const handleBatchImport = () => {
    Modal.info({
      title: '批量导入',
      content: '请选择 Excel 文件进行批量导入，支持 .xlsx 格式。',
    })
  }

  const handleExport = () => {
    message.success('导出成功，文件已下载')
  }

  const columns = [
    {
      title: '航班号',
      dataIndex: 'flightNo',
      key: 'flightNo',
      render: (text: string) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: '航空公司',
      dataIndex: 'airline',
      key: 'airline',
    },
    {
      title: '机型',
      dataIndex: 'aircraftType',
      key: 'aircraftType',
      ellipsis: true,
    },
    {
      title: '出发',
      key: 'departure',
      render: (_: unknown, record: Flight) => (
        <div>
          <div>{record.departureAirport}</div>
          <div style={{ color: '#999', fontSize: 12 }}>
            {record.scheduledDeparture.split(' ')[1]}
          </div>
        </div>
      ),
    },
    {
      title: '到达',
      key: 'arrival',
      render: (_: unknown, record: Flight) => (
        <div>
          <div>{record.arrivalAirport}</div>
          <div style={{ color: '#999', fontSize: 12 }}>
            {record.scheduledArrival.split(' ')[1]}
          </div>
        </div>
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
      title: '机位/登机口',
      key: 'location',
      render: (_: unknown, record: Flight) => (
        <Space>
          <Tag>机位: {record.stand}</Tag>
          <Tag>登机口: {record.gate}</Tag>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Flight) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该航班吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filters = (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Input
          placeholder="搜索航班号/航空公司"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={searchParams.keyword}
          onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
        />
        <Select
          placeholder="航班状态"
          style={{ width: 150 }}
          allowClear
          value={searchParams.status || undefined}
          onChange={(value) => setSearchParams({ ...searchParams, status: value })}
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <Select.Option key={key} value={key}>
              {label}
            </Select.Option>
          ))}
        </Select>
        <RangePicker
          placeholder={['开始日期', '结束日期']}
          onChange={(dates) => setSearchParams({ ...searchParams, date: dates || [] })}
        />
        <Button type="primary" onClick={fetchFlights}>
          <SearchOutlined /> 查询
        </Button>
        <Button onClick={() => setSearchParams({ keyword: '', status: '', date: [] })}>
          重置
        </Button>
      </Space>
    </Card>
  )

  const toolbar = (
    <Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedFlight(null); setFormModalVisible(true); }}>
        新增航班
      </Button>
      <Button icon={<ImportOutlined />} onClick={handleBatchImport}>
        批量导入
      </Button>
      <Button icon={<ExportOutlined />} onClick={handleExport}>
        导出数据
      </Button>
      <Button icon={<ReloadOutlined />} onClick={fetchFlights}>
        刷新
      </Button>
      <Button type="primary" ghost icon={<SyncOutlined spin />}>
        同步外部数据
      </Button>
    </Space>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>航班管理</h2>
            <p style={{ margin: 0, color: '#666' }}>管理航班基础数据、实时动态及资源分配</p>
          </Col>
          <Col>
            <Space>
              <Badge status="success" text="实时同步中" />
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>{toolbar}</div>
        {filters}
        <Table
          columns={columns}
          dataSource={flights}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="航班详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="edit" type="primary" onClick={() => { setDetailModalVisible(false); handleEdit(selectedFlight!); }}>
            编辑
          </Button>,
        ]}
        width={800}
      >
        {selectedFlight && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="航班号">{selectedFlight.flightNo}</Descriptions.Item>
              <Descriptions.Item label="航空公司">{selectedFlight.airline}</Descriptions.Item>
              <Descriptions.Item label="机型">{selectedFlight.aircraftType}</Descriptions.Item>
              <Descriptions.Item label="注册号">{selectedFlight.registration}</Descriptions.Item>
              <Descriptions.Item label="出发机场">{selectedFlight.departureAirport}</Descriptions.Item>
              <Descriptions.Item label="到达机场">{selectedFlight.arrivalAirport}</Descriptions.Item>
              <Descriptions.Item label="计划起飞">{selectedFlight.scheduledDeparture}</Descriptions.Item>
              <Descriptions.Item label="计划到达">{selectedFlight.scheduledArrival}</Descriptions.Item>
              <Descriptions.Item label="实际起飞">{selectedFlight.actualDeparture || '-'}</Descriptions.Item>
              <Descriptions.Item label="实际到达">{selectedFlight.actualArrival || '-'}</Descriptions.Item>
              <Descriptions.Item label="预计起飞">{selectedFlight.estimatedDeparture}</Descriptions.Item>
              <Descriptions.Item label="预计到达">{selectedFlight.estimatedArrival}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[selectedFlight.status] || 'default'}>
                  {statusLabels[selectedFlight.status] || selectedFlight.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="旅客人数">{selectedFlight.passengerCount} 人</Descriptions.Item>
              <Descriptions.Item label="登机口">{selectedFlight.gate}</Descriptions.Item>
              <Descriptions.Item label="机位">{selectedFlight.stand}</Descriptions.Item>
              <Descriptions.Item label="航站楼">{selectedFlight.terminal}</Descriptions.Item>
            </Descriptions>

            <Card title="航班事件轨迹" style={{ marginTop: 16 }} size="small">
              <Timeline>
                <Timeline.Item color="green">计划确认 - {selectedFlight.scheduledDeparture}</Timeline.Item>
                <Timeline.Item color="blue">值机开始 - 起飞前 48 小时</Timeline.Item>
                <Timeline.Item color="blue">登机口分配 - {selectedFlight.gate}</Timeline.Item>
                <Timeline.Item>等待旅客登机...</Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title={selectedFlight ? '编辑航班' : '新增航班'}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="flightNo"
                label="航班号"
                rules={[{ required: true, message: '请输入航班号' }]}
              >
                <Input placeholder="例如：MU5101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="airline"
                label="航空公司"
                rules={[{ required: true, message: '请选择航空公司' }]}
              >
                <Select placeholder="请选择">
                  <Select.Option value="国航">国航</Select.Option>
                  <Select.Option value="东航">东航</Select.Option>
                  <Select.Option value="南航">南航</Select.Option>
                  <Select.Option value="海航">海航</Select.Option>
                  <Select.Option value="厦航">厦航</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departureAirport"
                label="出发机场"
                rules={[{ required: true, message: '请输入出发机场' }]}
              >
                <Input placeholder="例如：上海浦东" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="arrivalAirport"
                label="到达机场"
                rules={[{ required: true, message: '请输入到达机场' }]}
              >
                <Input placeholder="例如：北京首都" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduledDeparture"
                label="计划起飞时间"
                rules={[{ required: true, message: '请选择时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scheduledArrival"
                label="计划到达时间"
                rules={[{ required: true, message: '请选择时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gate" label="登机口">
                <Input placeholder="例如：G12" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stand" label="机位">
                <Input placeholder="例如：S05" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态">
            <Select>
              {Object.entries(statusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setFormModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确认
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FlightManagement
