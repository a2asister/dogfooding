import { useEffect, useState } from 'react'
import { Table, Input, Select, DatePicker, Space, Card } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { logApi } from '@/services'
import type { LoginLog } from '@/types'


export default function LoginLogs() {
  const [list, setList] = useState<LoginLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [startDate, setStartDate] = useState<string | undefined>()
  const [endDate, setEndDate] = useState<string | undefined>()

  useEffect(() => {
    loadList()
  }, [page, pageSize, username, status, startDate, endDate])

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await logApi.getLoginLogs({ page, pageSize, username, status, startDate, endDate })
      const list = res.data.data.list.map((item: any) => ({
        ...item,
        userAgent: item.user_agent,
        loginTime: item.login_time
      }))
      setList(list)
      setTotal(res.data.data.total)
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnsType<LoginLog> = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 150 },
    { title: '设备', dataIndex: 'device', key: 'device', width: 120 },
    {
      title: '浏览器/系统',
      dataIndex: 'userAgent',
      key: 'userAgent',
      ellipsis: true,
      render: (ua: string) => (
        <span title={ua}>{ua}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => (
        <span style={{ color: s === 'success' ? '#52c41a' : '#ff4d4f' }}>
          {s === 'success' ? '成功' : '失败'}
        </span>
      )
    },
    { title: '登录时间', dataIndex: 'loginTime', key: 'loginTime', width: 200 }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">登录日志</h2>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索用户名"
            prefix={<SearchOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="登录状态"
            value={status}
            onChange={setStatus}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="success">成功</Select.Option>
            <Select.Option value="failed">失败</Select.Option>
          </Select>
          <DatePicker
            placeholder="开始日期"
            onChange={(date) => setStartDate(date ? date.format('YYYY-MM-DD') : undefined)}
          />
          <DatePicker
            placeholder="结束日期"
            onChange={(date) => setEndDate(date ? date.format('YYYY-MM-DD') : undefined)}
          />
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) }
          }}
        />
      </Card>
    </div>
  )
}
