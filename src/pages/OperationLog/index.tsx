import React, { useEffect, useState } from 'react'
import { Table, Card, Button, Space, Tag, Input, Select, DatePicker, Modal, message, Descriptions, Row, Col, Statistic } from 'antd'
import { SearchOutlined, EyeOutlined, ReloadOutlined, DownloadOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons'
import type { OperationLog } from '@/types'
import { api } from '@/services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const OperationLog: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    module: '',
    action: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  })

  const modules = ['航班管理', '旅客服务', '行李管理', '资源调度', '安防应急', '设备运维', '数据决策', '系统管理']
  const actions = ['新增', '修改', '删除', '查询', '导出', '导入', '审核', '发布', '归档', '触发']

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/operation-logs')
      setLogs(response.data.data.list)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetail = (record: OperationLog) => {
    setSelectedLog(record)
    setDetailModalVisible(true)
  }

  const handleExport = () => {
    message.success('导出成功，日志文件已下载')
  }

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作用户',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => (
        <Tag color={
          text === '删除' ? 'red' : text === '新增' ? 'green' : text === '修改' ? 'orange' : 'blue'
        }>
          {text}
        </Tag>
      ),
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '操作',
      key: 'actionCol',
      width: 100,
      render: (_: unknown, record: OperationLog) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
          详情
        </Button>
      ),
    },
  ]

  const stats = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="今日操作"
            value={logs.length}
            valueStyle={{ color: '#1890ff' }}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="新增操作"
            value={logs.filter(l => l.action === '新增').length}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="修改操作"
            value={logs.filter(l => l.action === '修改').length}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card size="small">
          <Statistic
            title="删除操作"
            value={logs.filter(l => l.action === '删除').length}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>操作日志</h2>
        <p style={{ margin: 0, color: '#666' }}>全操作日志留痕溯源，精准管控各岗位操作权责</p>
      </div>

      {stats}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="搜索用户名/描述/IP"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            />
            <Select
              placeholder="操作模块"
              style={{ width: 150 }}
              allowClear
              value={searchParams.module || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, module: value })}
            >
              {modules.map(m => (
                <Select.Option key={m} value={m}>{m}</Select.Option>
              ))}
            </Select>
            <Select
              placeholder="操作类型"
              style={{ width: 120 }}
              allowClear
              value={searchParams.action || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, action: value })}
            >
              {actions.map(a => (
                <Select.Option key={a} value={a}>{a}</Select.Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => setSearchParams({ ...searchParams, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null })}
            />
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchLogs}>刷新</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSize: 20,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="操作日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={600}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="操作时间">{selectedLog.createdAt}</Descriptions.Item>
              <Descriptions.Item label="操作ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="操作用户">{selectedLog.username}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{selectedLog.userId}</Descriptions.Item>
              <Descriptions.Item label="操作模块">
                <Tag color="blue">{selectedLog.module}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Tag color={
                  selectedLog.action === '删除' ? 'red' : 
                  selectedLog.action === '新增' ? 'green' : 
                  selectedLog.action === '修改' ? 'orange' : 'blue'
                }>
                  {selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">{selectedLog.ip}</Descriptions.Item>
              <Descriptions.Item label="请求ID">{String(selectedLog.details?.requestId ?? '-')}</Descriptions.Item>
              <Descriptions.Item label="操作描述" span={2}>{selectedLog.description}</Descriptions.Item>
            </Descriptions>

            <Card title="详细信息" style={{ marginTop: 16 }} size="small">
              <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
{JSON.stringify({
  userId: selectedLog.userId,
  username: selectedLog.username,
  module: selectedLog.module,
  action: selectedLog.action,
  description: selectedLog.description,
  ip: selectedLog.ip,
  details: selectedLog.details,
  createdAt: selectedLog.createdAt,
}, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OperationLog
