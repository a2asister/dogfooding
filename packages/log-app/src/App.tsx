import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Descriptions,
  Divider,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  DatePicker,
  InputNumber,
  Tooltip,
} from 'antd'
import {
  ReloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Log {
  id: string
  operatorId: string
  operatorName: string
  module: string
  action: string
  actionType: string
  targetId: string
  targetName: string
  status: 'success' | 'failed' | 'warning'
  ip: string
  userAgent: string
  requestMethod: string
  requestUrl: string
  requestParams: string
  responseCode: number
  responseMessage: string
  duration: number
  createdAt: string
}

const mockLogs: Log[] = [
  { id: 'l001', operatorId: 'u001', operatorName: '超级管理员', module: '用户管理', action: '登录', actionType: 'auth', targetId: 'u001', targetName: '超级管理员', status: 'success', ip: '192.168.1.100', userAgent: 'Chrome/120.0', requestMethod: 'POST', requestUrl: '/api/users/login', requestParams: '{"username":"admin"}', responseCode: 200, responseMessage: '登录成功', duration: 120, createdAt: '2024-05-04T08:30:00Z' },
  { id: 'l002', operatorId: 'u002', operatorName: '张三', module: '用户管理', action: '新增用户', actionType: 'create', targetId: 'u005', targetName: '新用户', status: 'success', ip: '192.168.1.101', userAgent: 'Firefox/121.0', requestMethod: 'POST', requestUrl: '/api/users', requestParams: '{"username":"newuser"}', responseCode: 201, responseMessage: '创建成功', duration: 85, createdAt: '2024-05-04T09:15:00Z' },
  { id: 'l003', operatorId: 'u003', operatorName: '李四', module: '权限管理', action: '分配权限', actionType: 'update', targetId: 'r002', targetName: '部门管理员', status: 'success', ip: '192.168.1.102', userAgent: 'Safari/17.0', requestMethod: 'PUT', requestUrl: '/api/roles/r002', requestParams: '{"permissionIds":["p001","p002"]}', responseCode: 200, responseMessage: '更新成功', duration: 65, createdAt: '2024-05-04T10:00:00Z' },
  { id: 'l004', operatorId: 'u001', operatorName: '超级管理员', module: '用户管理', action: '删除用户', actionType: 'delete', targetId: 'u006', targetName: '测试用户', status: 'failed', ip: '192.168.1.100', userAgent: 'Chrome/120.0', requestMethod: 'DELETE', requestUrl: '/api/users/u006', requestParams: '{}', responseCode: 403, responseMessage: '无权限删除', duration: 45, createdAt: '2024-05-04T11:30:00Z' },
]

const modules = ['用户管理', '权限管理', '角色管理', '部门管理', '工单管理', '审批管理', '系统设置']
const actionTypes = ['auth', 'create', 'update', 'delete', 'query', 'import', 'export']

const statusConfig = {
  success: { color: 'success', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, text: '成功' },
  failed: { color: 'error', icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />, text: '失败' },
  warning: { color: 'warning', icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />, text: '警告' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Log | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3005/api/logs`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setLogs(data.data || mockLogs)
        setPagination(prev => ({ ...prev, total: data.total || mockLogs.length }))
      } else {
        setLogs(mockLogs)
        setPagination(prev => ({ ...prev, total: mockLogs.length }))
      }
    } catch (error) {
      setLogs(mockLogs)
      setPagination(prev => ({ ...prev, total: mockLogs.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDetail = (record: Log) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const getStatusTag = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success
    return (
      <Tag color={config.color}>
        {config.icon} {config.text}
      </Tag>
    )
  }

  const columns: ColumnsType<Log> = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
      render: (name: string) => (
        <Tooltip title={name}>
          <span>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => <Tag>{module}</Tag>,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 100,
    },
    {
      title: '操作对象',
      dataIndex: 'targetName',
      key: 'targetName',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (ms: number) => (
        <Tag color={ms > 100 ? 'orange' : 'blue'}>{ms}ms</Tag>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: any, record: Log) => (
        <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={() => handleDetail(record)}>
          详情
        </Button>
      ),
    },
  ]

  const handleSearch = () => {
    message.info('正在搜索...')
  }

  const handleReset = () => {
    form.resetFields()
  }

  const successCount = logs.filter(l => l.status === 'success').length
  const failedCount = logs.filter(l => l.status === 'failed').length
  const warningCount = logs.filter(l => l.status === 'warning').length

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="总操作数"
                    value={logs.length}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="成功次数"
                    value={successCount}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="失败次数"
                    value={failedCount}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="警告次数"
                    value={warningCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="操作日志"
              bordered={false}
              extra={
                <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                  刷新
                </Button>
              }
            >
              <Form
                form={form}
                layout="inline"
                style={{ marginBottom: 16 }}
              >
                <Form.Item label="操作人">
                  <Input placeholder="请输入操作人" style={{ width: 150 }} />
                </Form.Item>
                <Form.Item label="模块">
                  <Select placeholder="全部模块" allowClear style={{ width: 130 }}>
                    {modules.map(m => (
                      <Select.Option key={m} value={m}>{m}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 100 }}>
                    <Select.Option value="success">成功</Select.Option>
                    <Select.Option value="failed">失败</Select.Option>
                    <Select.Option value="warning">警告</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="时间范围">
                  <DatePicker.RangePicker
                    style={{ width: 280 }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleSearch}>搜索</Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Form.Item>
              </Form>

              <Spin spinning={loading}>
                <Table
                  columns={columns}
                  dataSource={logs}
                  rowKey="id"
                  scroll={{ x: 1400 }}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
                  }}
                />
              </Spin>
            </Card>

            <Modal
              title="日志详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>,
              ]}
              width={800}
            >
              {selectedItem && (
                <>
                  <Descriptions bordered column={2} title="基本信息">
                    <Descriptions.Item label="日志ID">{selectedItem.id}</Descriptions.Item>
                    <Descriptions.Item label="操作时间">
                      {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="操作人">
                      {selectedItem.operatorName}
                      <Tag color="blue" style={{ marginLeft: 8 }}>ID: {selectedItem.operatorId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="IP地址">{selectedItem.ip}</Descriptions.Item>
                    <Descriptions.Item label="模块">{selectedItem.module}</Descriptions.Item>
                    <Descriptions.Item label="操作类型">{selectedItem.action}</Descriptions.Item>
                    <Descriptions.Item label="操作对象">
                      {selectedItem.targetName}
                      <Tag style={{ marginLeft: 8 }}>ID: {selectedItem.targetId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {getStatusTag(selectedItem.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="耗时">
                      <Tag color={selectedItem.duration > 100 ? 'orange' : 'blue'}>
                        {selectedItem.duration}ms
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="响应码">
                      <Tag color={selectedItem.responseCode === 200 ? 'success' : 'error'}>
                        {selectedItem.responseCode}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <Descriptions bordered column={2} title="请求信息">
                    <Descriptions.Item label="请求方法">
                      <Tag color="blue">{selectedItem.requestMethod}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="请求地址">{selectedItem.requestUrl}</Descriptions.Item>
                    <Descriptions.Item label="浏览器">{selectedItem.userAgent}</Descriptions.Item>
                    <Descriptions.Item label="响应消息">{selectedItem.responseMessage}</Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <Descriptions bordered column={1} title="请求参数">
                    <Descriptions.Item>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(JSON.parse(selectedItem.requestParams || '{}'), null, 2)}
                      </pre>
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Modal>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
