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
  Radio,
  DatePicker,
  Timeline,
  Steps,
  Badge,
  Empty,
  TextArea,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export interface Approval {
  id: string
  title: string
  description: string
  type: 'leave' | 'expense' | 'purchase' | 'promotion' | 'other'
  creatorId: string
  creatorName: string
  creatorDept: string
  
  currentStep: number
  totalSteps: number
  steps: ApprovalStep[]
  
  status: 'pending' | 'approving' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  updatedAt: string
  approvedAt: string | null
  rejectedAt: string | null
  
  amount: number | null
  startDate: string | null
  endDate: string | null
  attachments: string[]
}

export interface ApprovalStep {
  id: string
  name: string
  order: number
  approverId: string
  approverName: string
  status: 'pending' | 'approving' | 'approved' | 'rejected'
  approvedAt: string | null
  rejectedAt: string | null
  comment: string
}

const mockApprovals: Approval[] = [
  {
    id: 'ap001',
    title: '张三请假申请（5天）',
    description: '因个人原因需要请假5天，从2024-05-06至2024-05-10',
    type: 'leave',
    creatorId: 'u002',
    creatorName: '张三',
    creatorDept: '技术部',
    currentStep: 2,
    totalSteps: 3,
    steps: [
      { id: 's001', name: '部门主管审批', order: 1, approverId: 'u003', approverName: '李四', status: 'approved', approvedAt: '2024-05-03T09:30:00Z', rejectedAt: null, comment: '同意' },
      { id: 's002', name: 'HR审批', order: 2, approverId: 'u001', approverName: '超级管理员', status: 'approving', approvedAt: null, rejectedAt: null, comment: '' },
      { id: 's003', name: '总经理审批', order: 3, approverId: 'u001', approverName: '超级管理员', status: 'pending', approvedAt: null, rejectedAt: null, comment: '' },
    ],
    status: 'approving',
    createdAt: '2024-05-03T08:00:00Z',
    updatedAt: '2024-05-03T09:30:00Z',
    approvedAt: null,
    rejectedAt: null,
    amount: null,
    startDate: '2024-05-06T00:00:00Z',
    endDate: '2024-05-10T23:59:59Z',
    attachments: [],
  },
  {
    id: 'ap002',
    title: '李四采购申请（办公设备）',
    description: '需要采购新的显示器和键盘，预计费用3000元',
    type: 'purchase',
    creatorId: 'u003',
    creatorName: '李四',
    creatorDept: '技术部',
    currentStep: 3,
    totalSteps: 3,
    steps: [
      { id: 's001', name: '部门主管审批', order: 1, approverId: 'u002', approverName: '张三', status: 'approved', approvedAt: '2024-05-02T10:00:00Z', rejectedAt: null, comment: '同意采购' },
      { id: 's002', name: '财务审批', order: 2, approverId: 'u001', approverName: '超级管理员', status: 'approved', approvedAt: '2024-05-02T14:00:00Z', rejectedAt: null, comment: '预算内，同意' },
      { id: 's003', name: '总经理审批', order: 3, approverId: 'u001', approverName: '超级管理员', status: 'approved', approvedAt: '2024-05-02T16:00:00Z', rejectedAt: null, comment: '同意' },
    ],
    status: 'approved',
    createdAt: '2024-05-02T09:00:00Z',
    updatedAt: '2024-05-02T16:00:00Z',
    approvedAt: '2024-05-02T16:00:00Z',
    rejectedAt: null,
    amount: 3000,
    startDate: null,
    endDate: null,
    attachments: ['采购清单.pdf'],
  },
  {
    id: 'ap003',
    title: '王五报销申请（差旅费）',
    description: '出差费用报销，共计1500元',
    type: 'expense',
    creatorId: 'u004',
    creatorName: '王五',
    creatorDept: '市场部',
    currentStep: 1,
    totalSteps: 2,
    steps: [
      { id: 's001', name: '部门主管审批', order: 1, approverId: 'u001', approverName: '超级管理员', status: 'rejected', approvedAt: null, rejectedAt: '2024-05-01T11:00:00Z', comment: '发票不全，请补充后重新提交' },
      { id: 's002', name: '财务审批', order: 2, approverId: 'u001', approverName: '超级管理员', status: 'pending', approvedAt: null, rejectedAt: null, comment: '' },
    ],
    status: 'rejected',
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-05-01T11:00:00Z',
    approvedAt: null,
    rejectedAt: '2024-05-01T11:00:00Z',
    amount: 1500,
    startDate: null,
    endDate: null,
    attachments: ['车票.pdf'],
  },
]

const typeConfig = {
  leave: { label: '请假申请', color: 'blue' },
  expense: { label: '报销申请', color: 'green' },
  purchase: { label: '采购申请', color: 'orange' },
  promotion: { label: '升职申请', color: 'purple' },
  other: { label: '其他申请', color: 'default' },
}

const statusConfig = {
  pending: { label: '待提交', color: 'default' },
  approving: { label: '审批中', color: 'processing' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  cancelled: { label: '已取消', color: 'default' },
}

const App: React.FC<{ routerBase?: string }> = () => {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Approval | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [rejectVisible, setRejectVisible] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'all'>('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3008/api/approvals`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.success) {
        setApprovals(data.data || mockApprovals)
        setPagination(prev => ({ ...prev, total: data.total || mockApprovals.length }))
      } else {
        setApprovals(mockApprovals)
        setPagination(prev => ({ ...prev, total: mockApprovals.length }))
      }
    } catch (error) {
      setApprovals(mockApprovals)
      setPagination(prev => ({ ...prev, total: mockApprovals.length }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDetail = (record: Approval) => {
    setSelectedItem(record)
    setDetailVisible(true)
  }

  const handleApprove = (approval: Approval) => {
    const now = new Date().toISOString()
    const updatedSteps = approval.steps.map(step => {
      if (step.status === 'approving') {
        return { ...step, status: 'approved' as const, approvedAt: now, comment: '同意' }
      }
      return step
    })
    
    const nextPendingStep = updatedSteps.find(s => s.status === 'pending')
    const allApproved = updatedSteps.every(s => s.status === 'approved')
    
    const updates: Partial<Approval> = {
      steps: updatedSteps,
      updatedAt: now,
    }
    
    if (nextPendingStep) {
      updates.currentStep = nextPendingStep.order
      nextPendingStep.status = 'approving'
    }
    
    if (allApproved) {
      updates.status = 'approved'
      updates.approvedAt = now
    }
    
    setApprovals(prev => prev.map(a => a.id === approval.id ? { ...a, ...updates } : a))
    message.success('审批通过')
    setDetailVisible(false)
  }

  const handleReject = () => {
    if (!selectedItem) return
    const now = new Date().toISOString()
    const updatedSteps = selectedItem.steps.map(step => {
      if (step.status === 'approving') {
        return { ...step, status: 'rejected' as const, rejectedAt: now, comment: rejectComment }
      }
      return step
    })
    
    setApprovals(prev => prev.map(a => 
      a.id === selectedItem.id 
        ? { 
            ...a, 
            steps: updatedSteps, 
            status: 'rejected', 
            rejectedAt: now, 
            updatedAt: now 
          } 
        : a
    ))
    message.success('已驳回')
    setRejectVisible(false)
    setDetailVisible(false)
  }

  const columns: ColumnsType<Approval> = [
    {
      title: '审批标题',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (title: string, record: Approval) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.id}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '审批进度',
      key: 'progress',
      width: 200,
      render: (_: any, record: Approval) => (
        <div>
          <Steps
            direction="horizontal"
            size="small"
            current={record.currentStep - 1}
            status={
              record.status === 'rejected' ? 'error' :
              record.status === 'approved' ? 'finish' :
              'process'
            }
            items={record.steps.map(step => ({
              title: null,
              description: step.approverName,
              status:
                step.status === 'approved' ? 'finish' :
                step.status === 'rejected' ? 'error' :
                step.status === 'approving' ? 'process' :
                'wait',
            }))}
          />
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            第 {record.currentStep}/{record.totalSteps} 步
          </div>
        </div>
      ),
    },
    {
      title: '申请人',
      key: 'creator',
      width: 120,
      render: (_: any, record: Approval) => (
        <div>
          <div>{record.creatorName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.creatorDept}</div>
        </div>
      ),
    },
    {
      title: '金额/天数',
      key: 'amount',
      width: 100,
      render: (_: any, record: Approval) => {
        if (record.amount) {
          return <Tag color="orange">¥{record.amount.toLocaleString()}</Tag>
        }
        if (record.startDate && record.endDate) {
          const days = dayjs(record.endDate).diff(dayjs(record.startDate), 'day') + 1
          return <Tag color="blue">{days}天</Tag>
        }
        return '-'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: Approval) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleDetail(record)}>
            详情
          </Button>
          {record.status === 'approving' && (
            <>
              <Button type="link" size="small" onClick={() => handleApprove(record)}>
                同意
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  setSelectedItem(record)
                  setRejectVisible(true)
                }}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const handleSearch = () => {
    message.info('正在搜索...')
  }

  const handleReset = () => {
    form.resetFields()
  }

  const totalCount = approvals.length
  const pendingCount = approvals.filter(a => a.status === 'pending' || a.status === 'approving').length
  const approvedCount = approvals.filter(a => a.status === 'approved').length
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="总审批数"
                    value={totalCount}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="待审批"
                    value={pendingCount}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="已通过"
                    value={approvedCount}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="已驳回"
                    value={rejectedCount}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="审批列表"
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
                <Form.Item label="关键词">
                  <Input placeholder="审批标题" style={{ width: 180 }} />
                </Form.Item>
                <Form.Item label="类型">
                  <Select placeholder="全部类型" allowClear style={{ width: 120 }}>
                    {Object.entries(typeConfig).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="状态">
                  <Select placeholder="全部状态" allowClear style={{ width: 100 }}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <Select.Option key={key} value={key}>{val.label}</Select.Option>
                    ))}
                  </Select>
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
                  dataSource={approvals}
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
              title="审批详情"
              open={detailVisible}
              onCancel={() => setDetailVisible(false)}
              width={900}
              footer={[
                <Space key="actions">
                  {selectedItem && selectedItem.status === 'approving' && (
                    <>
                      <Button type="primary" onClick={() => handleApprove(selectedItem)}>
                        同意
                      </Button>
                      <Button
                        danger
                        onClick={() => {
                          setRejectVisible(true)
                        }}
                      >
                        驳回
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setDetailVisible(false)}>
                    关闭
                  </Button>
                </Space>,
              ]}
            >
              {selectedItem && (
                <>
                  <Descriptions bordered column={2} title="基本信息">
                    <Descriptions.Item label="审批ID">{selectedItem.id}</Descriptions.Item>
                    <Descriptions.Item label="标题">{selectedItem.title}</Descriptions.Item>
                    <Descriptions.Item label="类型">
                      {(() => {
                        const config = typeConfig[selectedItem.type as keyof typeof typeConfig] || typeConfig.other
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {(() => {
                        const config = statusConfig[selectedItem.status as keyof typeof statusConfig] || statusConfig.pending
                        return <Tag color={config.color}>{config.label}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="申请人">
                      <div>{selectedItem.creatorName}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{selectedItem.creatorDept}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="金额">
                      {selectedItem.amount ? `¥${selectedItem.amount.toLocaleString()}` : '-'}
                    </Descriptions.Item>
                    {selectedItem.startDate && selectedItem.endDate && (
                      <Descriptions.Item label="日期范围" span={2}>
                        {dayjs(selectedItem.startDate).format('YYYY-MM-DD')} 至 {dayjs(selectedItem.endDate).format('YYYY-MM-DD')}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="创建时间" span={2}>
                      {dayjs(selectedItem.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>

                  {selectedItem.description && (
                    <>
                      <Divider />
                      <Descriptions bordered column={1} title="申请理由">
                        <Descriptions.Item>{selectedItem.description}</Descriptions.Item>
                      </Descriptions>
                    </>
                  )}

                  <Divider />
                  <div>
                    <h4 style={{ marginBottom: 20 }}>审批流程</h4>
                    <Steps
                      direction="vertical"
                      current={selectedItem.currentStep - 1}
                      status={
                        selectedItem.status === 'rejected' ? 'error' :
                        selectedItem.status === 'approved' ? 'finish' :
                        'process'
                      }
                      items={selectedItem.steps.map(step => ({
                        title: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{step.name}</span>
                            {step.status === 'approved' && (
                              <Tag color="success">已通过 - {step.approverName}</Tag>
                            )}
                            {step.status === 'rejected' && (
                              <Tag color="error">已驳回 - {step.approverName}</Tag>
                            )}
                            {step.status === 'approving' && (
                              <Tag color="processing">审批中 - {step.approverName}</Tag>
                            )}
                            {step.status === 'pending' && (
                              <Tag>待审批 - {step.approverName}</Tag>
                            )}
                          </div>
                        ),
                        description: (
                          <div>
                            {step.comment && (
                              <div style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                意见：{step.comment}
                              </div>
                            )}
                            {step.approvedAt && (
                              <div style={{ fontSize: 12, color: '#999' }}>
                                审批时间：{dayjs(step.approvedAt).format('YYYY-MM-DD HH:mm:ss')}
                              </div>
                            )}
                            {step.rejectedAt && (
                              <div style={{ fontSize: 12, color: '#999' }}>
                                驳回时间：{dayjs(step.rejectedAt).format('YYYY-MM-DD HH:mm:ss')}
                              </div>
                            )}
                          </div>
                        ),
                        status:
                          step.status === 'approved' ? 'finish' :
                          step.status === 'rejected' ? 'error' :
                          step.status === 'approving' ? 'process' :
                          'wait',
                      }))}
                    />
                  </div>
                </>
              )}
            </Modal>

            <Modal
              title="驳回审批"
              open={rejectVisible}
              onCancel={() => setRejectVisible(false)}
              onOk={handleReject}
            >
              <Form>
                <Form.Item label="驳回理由" rules={[{ required: true, message: '请输入驳回理由' }]}>
                  <TextArea
                    rows={4}
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="请输入驳回理由..."
                  />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
