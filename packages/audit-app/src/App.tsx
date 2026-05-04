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
  Tooltip,
  Timeline,
} from 'antd'
import {
  ReloadOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface AuditRecord {
  id: string
  operatorId: string
  operatorName: string
  operatorRole: string
  action: string
  actionType: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'other'
  module: string
  targetType: string
  targetId: string
  targetName: string
  oldValue: string
  newValue: string
  ip: string
  location: string
  userAgent: string
  level: 'info' | 'warning' | 'danger'
  status: 'success' | 'failed' | 'pending'
  reason: string
  remark: string
  createdAt: string
}

const mockAudits: AuditRecord[] = [
  { id: 'a001', operatorId: 'u001', operatorName: '超级管理员', operatorRole: '超级管理员', action: '修改系统设置', actionType: 'update', module: '系统设置', targetType: 'setting', targetId: 's001', targetName: '网站名称', oldValue: '{"value":"SaaS管理系统"}', newValue: '{"value":"SaaS企业管理平台"}', ip: '192.168.1.100', location: '北京市', userAgent: 'Chrome/120.0', level: 'info', status: 'success', reason: '系统升级', remark: '', createdAt: '2024-05-04T08:30:00Z' },
  { id: 'a002', operatorId: 'u002', operatorName: '张三', operatorRole: '部门管理员', action: '删除用户', actionType: 'delete', module: '用户管理', targetType: 'user', targetId: 'u005', targetName: '测试用户', oldValue: '{"username":"testuser","status":"active"}', newValue: '{}', ip: '192.168.1.101', location: '上海市', userAgent: 'Firefox/121.0', level: 'warning', status: 'success', reason: '账号注销', remark: '', createdAt: '2024-05-04T09:15:00Z' },
  { id: 'a003', operatorId: 'u003', operatorName: '李四', operatorRole: '普通员工', action: '导出数据', actionType: 'export', module: '工单管理', targetType: 'ticket', targetId: '', targetName: '工单数据', oldValue: '', newValue: '', ip: '192.168.1.102', location: '广州市', userAgent: 'Safari/17.0', level: 'info', status: 'success', reason: '报表制作', remark: '导出100条数据', createdAt: '2024-05-04T10:00:00Z' },
  { id: 'a004', operatorId: 'u004', operatorName: '王五', operatorRole: '普通员工', action: '修改角色权限', actionType: 'update', module: '权限管理', targetType: 'role', targetId: 'r003', targetName: '普通员工', oldValue: '{"permissionIds":["p001"]}', newValue: '{"permissionIds":["p001","p002"]}', ip: '192.168.1.103', location: '深圳市', userAgent: 'Chrome/120.0', level: 'danger', status: 'pending', reason: '权限越界', remark: '申请审核中', createdAt: '2024-05-04T11:30:00Z' },
]

const actionTypeMap: Record<string, { label: string; color: string }> = {
  login: { label: '登录', color: 'green' },
  logout: { label: '登出', color: 'default' },
  create: { label: '创建', color: 'blue' },
  update: { label: '更新', color: 'orange' },
  delete: { label: '删除', color: 'red' },
  export: { label: '导出', color: 'cyan' },
  import: { label: '导入', color: 'purple' },
  other: { label: '其他', color: 'default' },
}

const levelMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  info: { label: '一般', color: 'default', icon: <InfoCircleOutlined /> },
  warning: { label: '警告', color: 'warning', icon: <ExclamationCircleOutlined /> },
  danger: { label: '高危', color: 'error', icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> },
}

const statusMap: Record<string, { label: string; color: string }> = {
  success: { label: '已完成', color: 'success' },
  failed: { label: '已失败', color: 'error' },
  pending: { label: '待审核', color: 'warning' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<AuditRecord | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3006/api/audits`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setAudits(data.data || mockAudits)
        setPagination(prev => ({ ...prev, total: data.total || mockAudits.length }))
      } else {
        setAudits(mockAudits)
        setPagination(prev => ({ ...prev, total: mockAudits.length }))
      }
    } catch (error) {
      setAudits(mockAudits)
      setPagination(prev => ({ ...prev, total: mockAudits.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDetail = (record: AuditRecord) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const columns: ColumnsType<AuditRecord> = [
    {
      title: '时间',
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
      render: (name: string, record: AuditRecord) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.operatorRole}</div>
        </div>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 90,
      render: (type: string) => {
        const config = actionTypeMap[type] || actionTypeMap.other
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => <Tag>{module}</Tag>,
    },
    {
      title: '操作对象',
      dataIndex: 'targetName',
      key: 'targetName',
      ellipsis: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const config = levelMap[level] || levelMap.info
        return (
          <Tag color={config.color}>
            {config.icon} {config.label}
          </Tag>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const config = statusMap[status] || statusMap.success
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'IP/位置',
      key: 'ipLocation',
      width: 150,
      render: (_: any, record: AuditRecord) => (
        <Tooltip title={`${record.ip} - ${record.location}`}>
          <div style={{ fontSize: 12 }}>
            <div>{record.ip}</div>
            <div style={{ color: '#999' }}>{record.location}</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: any, record: AuditRecord) => (
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

  const infoCount = audits.filter(a => a.level === 'info').length
  const warningCount = audits.filter(a => a.level === 'warning').length
  const dangerCount = audits.filter(a => a.level === 'danger').length

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="审计记录总数"
                    value={audits.length}
                    prefix={<AuditOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="一般操作"
                    value={infoCount}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<InfoCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="警告操作"
                    value={warningCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="高危操作"
                    value={dangerCount}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="审计日志"
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
                <Form.Item label="操作类型">
                  <Select placeholder="全部类型" allowClear style={{ width: 100 }}>
                    {Object.entries(actionTypeMap).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="级别">
                  <Select placeholder="全部级别" allowClear style={{ width: 100 }}>
                    {Object.entries(levelMap).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 100 }}>
                    {Object.entries(statusMap).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
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
                  dataSource={audits}
                  rowKey="id"
                  scroll={{ x: 1500 }}
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
              title="审计详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailVisible(false)}>
                  关闭
                </Button>,
              ]}
              width={900}
            >
              {selectedItem && (
                <>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Descriptions bordered column={1} title="基本信息" size="small">
                        <Descriptions.Item label="审计ID">{selectedItem.id}</Descriptions.Item>
                        <Descriptions.Item label="操作时间">
                          {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="操作人">
                          <div>{selectedItem.operatorName}</div>
                          <Tag color="blue">{selectedItem.operatorRole}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="操作类型">
                          {(() => {
                            const config = actionTypeMap[selectedItem.actionType] || actionTypeMap.other
                            return <Tag color={config.color}>{config.label}</Tag>
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="模块">{selectedItem.module}</Descriptions.Item>
                        <Descriptions.Item label="操作">{selectedItem.action}</Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={12}>
                      <Descriptions bordered column={1} title="状态信息" size="small">
                        <Descriptions.Item label="级别">
                          {(() => {
                            const config = levelMap[selectedItem.level] || levelMap.info
                            return (
                              <Tag color={config.color}>
                                {config.icon} {config.label}
                              </Tag>
                            )
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                          {(() => {
                            const config = statusMap[selectedItem.status] || statusMap.success
                            return <Tag color={config.color}>{config.label}</Tag>
                          })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="IP地址">{selectedItem.ip}</Descriptions.Item>
                        <Descriptions.Item label="地理位置">{selectedItem.location}</Descriptions.Item>
                        <Descriptions.Item label="浏览器">{selectedItem.userAgent}</Descriptions.Item>
                        <Descriptions.Item label="原因">{selectedItem.reason || '-'}</Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>

                  {selectedItem.remark && (
                    <>
                      <Divider />
                      <Descriptions bordered column={1} title="备注">
                        <Descriptions.Item>{selectedItem.remark}</Descriptions.Item>
                      </Descriptions>
                    </>
                  )}

                  {(selectedItem.oldValue || selectedItem.newValue) && (
                    <>
                      <Divider />
                      <Descriptions bordered column={1} title="变更对比">
                        <Descriptions.Item label="变更前">
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fff7e6', padding: 8, borderRadius: 4 }}>
                            {selectedItem.oldValue || '无'}
                          </pre>
                        </Descriptions.Item>
                        <Descriptions.Item label="变更后">
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f6ffed', padding: 8, borderRadius: 4 }}>
                            {selectedItem.newValue || '无'}
                          </pre>
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  )}
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
