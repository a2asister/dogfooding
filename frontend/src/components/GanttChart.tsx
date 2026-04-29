import React, { useMemo } from 'react'
import { Card, Typography, Tag, Empty, Spin, Tooltip, Select, Space, DatePicker, Button } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import type { Issue, IssueStatus } from '@/types'
import dayjs from 'dayjs'
import { CalendarOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface GanttChartProps {
  issues: Issue[]
  loading?: boolean
  onIssueClick?: (issue: Issue) => void
}

const STATUS_COLORS: Record<IssueStatus, string> = {
  todo: '#bfbfbf',
  in_progress: '#1890ff',
  review: '#722ed1',
  done: '#52c41a',
  closed: '#8c8c8c',
  reopened: '#fa8c16',
  blocked: '#f5222d',
}

const STATUS_NAMES: Record<IssueStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核中',
  done: '已完成',
  closed: '已关闭',
  reopened: '重新打开',
  blocked: '已阻塞',
}

const GanttChart: React.FC<GanttChartProps> = ({ issues, loading, onIssueClick }) => {
  const [dateRange, setDateRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const chartData = useMemo(() => {
    const tasksWithDates = issues.filter(
      issue => issue.startDate && issue.dueDate
    )

    if (tasksWithDates.length === 0) return []

    let minDate = dayjs(tasksWithDates[0].startDate!)
    let maxDate = dayjs(tasksWithDates[0].dueDate!)

    tasksWithDates.forEach(issue => {
      if (issue.startDate) {
        const start = dayjs(issue.startDate)
        if (start.isBefore(minDate)) minDate = start
      }
      if (issue.dueDate) {
        const due = dayjs(issue.dueDate)
        if (due.isAfter(maxDate)) maxDate = due
      }
    })

    if (dateRange) {
      minDate = dateRange[0]
      maxDate = dateRange[1]
    } else {
      minDate = minDate.subtract(1, 'week')
      maxDate = maxDate.add(1, 'week')
    }

    const totalDays = maxDate.diff(minDate, 'day') + 1

    const data = tasksWithDates
      .filter(issue => {
        if (!dateRange) return true
        const start = dayjs(issue.startDate!)
        const due = dayjs(issue.dueDate!)
        return start.isBefore(maxDate) && due.isAfter(minDate)
      })
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0
        return dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
      })
      .map(issue => {
        const start = dayjs(issue.startDate!)
        const due = dayjs(issue.dueDate!)
        
        const startOffset = start.diff(minDate, 'day')
        const duration = due.diff(start, 'day') + 1
        
        const progress = issue.originalEstimate && issue.originalEstimate > 0
          ? Math.round(((issue.timeSpent || 0) / issue.originalEstimate) * 100)
          : issue.status === 'done' ? 100 : 0

        return {
          id: issue.id,
          name: issue.summary,
          key: issue.issueKey,
          start: start.format('MM-DD'),
          end: due.format('MM-DD'),
          status: issue.status,
          progress,
          startOffset: Math.max(0, startOffset),
          duration: Math.max(1, duration),
          totalDays,
        }
      })

    return data
  }, [issues, dateRange])

  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return []
    
    const uniqueStarts = [...new Set(chartData.map(d => d.start))]
    return uniqueStarts.sort((a, b) => dayjs(a, 'MM-DD').valueOf() - dayjs(b, 'MM-DD').valueOf())
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            甘特图
          </Title>
        </div>
        <Empty description="暂无带日期的事项数据，无法显示甘特图" />
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload
      return (
        <div style={{ background: '#fff', padding: 12, border: '1px solid #e8e8e8', borderRadius: 4 }}>
          <Text strong>{data.key}</Text>
          <div style={{ marginTop: 4 }}>{data.name}</div>
          <div style={{ marginTop: 4, color: '#666' }}>
            开始: {data.start} | 结束: {data.end}
          </div>
          <div style={{ marginTop: 4 }}>
            进度: <Tag color={data.progress >= 100 ? 'success' : 'processing'}>{data.progress}%</Tag>
          </div>
          <div style={{ marginTop: 4 }}>
            状态: <Tag color={STATUS_COLORS[data.status as IssueStatus]}>{STATUS_NAMES[data.status as IssueStatus]}</Tag>
          </div>
        </div>
      )
    }
    return null
  }

  const handleBarClick = (data: any) => {
    const issue = issues.find(i => i.id === data.id)
    if (issue && onIssueClick) {
      onIssueClick(issue)
    }
  }

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          甘特图
        </Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            placeholder={['开始日期', '结束日期']}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setDateRange(null)}
          >
            重置
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_NAMES).map(([status, name]) => (
          <Tag key={status} color={STATUS_COLORS[status as IssueStatus]}>
            {name}
          </Tag>
        ))}
      </div>

      <div style={{ height: Math.max(400, chartData.length * 40 + 100) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[0, 'dataMax']}
              hide
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={200}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar
              dataKey="duration"
              xAxisId={0}
              radius={[0, 4, 4, 0]}
              onClick={(data) => handleBarClick(data)}
              cursor="pointer"
              barSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status as IssueStatus]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', color: '#8c8c8c' }}>
        <Text type="secondary">共 {chartData.length} 个带日期的事项</Text>
        <Text type="secondary">点击条形图可查看事项详情</Text>
      </div>
    </Card>
  )
}

export default GanttChart
