import React, { useMemo } from 'react'
import { Card, Typography, Tag, Empty, Spin, Badge, Tooltip, Select, Space, Button, Modal, List } from 'antd'
import { CalendarOutlined, ReloadOutlined, LeftOutlined, RightOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons'
import type { Issue, IssueStatus } from '@/types'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const { Title, Text } = Typography

interface CalendarViewProps {
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

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

type ViewMode = 'month' | 'week' | 'list'

const CalendarView: React.FC<CalendarViewProps> = ({ issues, loading, onIssueClick }) => {
  const [currentDate, setCurrentDate] = React.useState(dayjs())
  const [viewMode, setViewMode] = React.useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(null)
  const [modalVisible, setModalVisible] = React.useState(false)
  const [selectedIssues, setSelectedIssues] = React.useState<Issue[]>([])

  const issuesByDate = useMemo(() => {
    const map = new Map<string, Issue[]>()

    issues.forEach(issue => {
      const dates = new Set<string>()

      if (issue.dueDate) {
        dates.add(dayjs(issue.dueDate).format('YYYY-MM-DD'))
      }

      if (issue.startDate) {
        dates.add(dayjs(issue.startDate).format('YYYY-MM-DD'))
      }

      if (issue.startDate && issue.dueDate) {
        const start = dayjs(issue.startDate)
        const end = dayjs(issue.dueDate)
        let current = start.add(1, 'day')
        
        while (current.isBefore(end)) {
          dates.add(current.format('YYYY-MM-DD'))
          current = current.add(1, 'day')
        }
      }

      dates.forEach(dateStr => {
        if (!map.has(dateStr)) {
          map.set(dateStr, [])
        }
        const existing = map.get(dateStr)!
        if (!existing.find(i => i.id === issue.id)) {
          existing.push(issue)
        }
      })
    })

    return map
  }, [issues])

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const firstDay = currentDate.startOf('month')
      const lastDay = currentDate.endOf('month')
      const firstDayOfWeek = firstDay.day()
      const totalDays = lastDay.diff(firstDay, 'day') + 1

      const days = []

      for (let i = 0; i < firstDayOfWeek; i++) {
        const prevDate = firstDay.subtract(firstDayOfWeek - i, 'day')
        days.push({
          date: prevDate,
          isCurrentMonth: false,
          isToday: prevDate.isSame(dayjs(), 'day'),
          issues: issuesByDate.get(prevDate.format('YYYY-MM-DD')) || [],
        })
      }

      for (let i = 0; i < totalDays; i++) {
        const date = firstDay.add(i, 'day')
        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.isSame(dayjs(), 'day'),
          issues: issuesByDate.get(date.format('YYYY-MM-DD')) || [],
        })
      }

      const remaining = 42 - days.length
      for (let i = 0; i < remaining; i++) {
        const nextDate = lastDay.add(i + 1, 'day')
        days.push({
          date: nextDate,
          isCurrentMonth: false,
          isToday: nextDate.isSame(dayjs(), 'day'),
          issues: issuesByDate.get(nextDate.format('YYYY-MM-DD')) || [],
        })
      }

      return days
    } else if (viewMode === 'week') {
      const weekStart = currentDate.startOf('week')
      const days = []

      for (let i = 0; i < 7; i++) {
        const date = weekStart.add(i, 'day')
        days.push({
          date,
          isCurrentMonth: true,
          isToday: date.isSame(dayjs(), 'day'),
          issues: issuesByDate.get(date.format('YYYY-MM-DD')) || [],
        })
      }

      return days
    }

    return []
  }, [currentDate, viewMode, issuesByDate])

  const listViewData = useMemo(() => {
    const sortedIssues = [...issues]
      .filter(i => i.dueDate || i.startDate)
      .sort((a, b) => {
        const dateA = a.dueDate || a.startDate
        const dateB = b.dueDate || b.startDate
        if (!dateA) return 1
        if (!dateB) return -1
        return dayjs(dateA).valueOf() - dayjs(dateB).valueOf()
      })
    return sortedIssues
  }, [issues])

  const handleDateClick = (date: dayjs.Dayjs, dayIssues: Issue[]) => {
    if (dayIssues.length > 0) {
      setSelectedDate(date)
      setSelectedIssues(dayIssues)
      setModalVisible(true)
    }
  }

  const handleIssueClick = (issue: Issue) => {
    setModalVisible(false)
    if (onIssueClick) {
      onIssueClick(issue)
    }
  }

  const navigateDate = (direction: number) => {
    if (viewMode === 'month') {
      setCurrentDate(currentDate.add(direction, 'month'))
    } else if (viewMode === 'week') {
      setCurrentDate(currentDate.add(direction, 'week'))
    }
  }

  const goToToday = () => {
    setCurrentDate(dayjs())
  }

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  const renderMonthView = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 8 }}>
        {WEEKDAYS.map(day => (
          <div 
            key={day} 
            style={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              padding: 12,
              color: '#666',
              background: '#fafafa',
            }}
          >
            {day}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {calendarDays.map((day, index) => {
          const isWeekend = day.date.day() === 0 || day.date.day() === 6
          return (
            <div
              key={index}
              style={{
                minHeight: 100,
                padding: 8,
                background: day.isToday 
                  ? '#e6f7ff' 
                  : !day.isCurrentMonth 
                    ? '#fafafa' 
                    : isWeekend 
                      ? '#fafafa'
                      : '#fff',
                border: day.isToday ? '1px solid #1890ff' : '1px solid #f0f0f0',
                cursor: day.issues.length > 0 ? 'pointer' : 'default',
                opacity: !day.isCurrentMonth ? 0.5 : 1,
              }}
              onClick={() => handleDateClick(day.date, day.issues)}
            >
              <div style={{ 
                fontWeight: day.isToday ? 600 : 400,
                color: day.isToday ? '#1890ff' : '#333',
                marginBottom: 4,
              }}>
                {day.date.format('D')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {day.issues.slice(0, 3).map(issue => (
                  <Tooltip key={issue.id} title={issue.summary}>
                    <Tag
                      color={STATUS_COLORS[issue.status]}
                      style={{ 
                        margin: 0, 
                        fontSize: 11, 
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {issue.issueKey}
                    </Tag>
                  </Tooltip>
                ))}
                {day.issues.length > 3 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    +{day.issues.length - 3} 更多
                  </Text>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 8 }}>
        {calendarDays.map((day, index) => (
          <div 
            key={index}
            style={{ 
              textAlign: 'center', 
              fontWeight: 600, 
              padding: 12,
              color: day.isToday ? '#1890ff' : '#666',
              background: day.isToday ? '#e6f7ff' : '#fafafa',
            }}
          >
            <div>{WEEKDAYS[day.date.day()]}</div>
            <div style={{ fontSize: 20, marginTop: 4 }}>{day.date.format('D')}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {calendarDays.map((day, index) => (
          <div
            key={index}
            style={{
              minHeight: 300,
              padding: 8,
              background: day.isToday ? '#e6f7ff' : '#fff',
              border: day.isToday ? '1px solid #1890ff' : '1px solid #f0f0f0',
              cursor: day.issues.length > 0 ? 'pointer' : 'default',
            }}
            onClick={() => handleDateClick(day.date, day.issues)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {day.issues.map(issue => (
                <Tooltip key={issue.id} title={issue.summary}>
                  <Tag
                    color={STATUS_COLORS[issue.status]}
                    style={{ 
                      margin: 0, 
                      fontSize: 11,
                    }}
                  >
                    {issue.issueKey}: {issue.summary.length > 15 ? issue.summary.substring(0, 15) + '...' : issue.summary}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderListView = () => (
    <List
      dataSource={listViewData}
      locale={{ emptyText: <Empty description="暂无带日期的事项" /> }}
      renderItem={issue => (
        <List.Item
          style={{ cursor: 'pointer' }}
          onClick={() => handleIssueClick(issue)}
        >
          <List.Item.Meta
            avatar={<Tag color={STATUS_COLORS[issue.status]}>{STATUS_NAMES[issue.status]}</Tag>}
            title={
              <Space>
                <Text strong>{issue.issueKey}</Text>
                <Text>{issue.summary}</Text>
              </Space>
            }
            description={
              <Space>
                {issue.startDate && (
                  <Text type="secondary">
                    开始: {dayjs(issue.startDate).format('YYYY-MM-DD')}
                  </Text>
                )}
                {issue.dueDate && (
                  <Text type="secondary" style={{ 
                    color: dayjs(issue.dueDate).isBefore(dayjs()) && !['done', 'closed'].includes(issue.status)
                      ? '#f5222d'
                      : undefined
                  }}>
                    截止: {dayjs(issue.dueDate).format('YYYY-MM-DD')}
                    {dayjs(issue.dueDate).isBefore(dayjs()) && !['done', 'closed'].includes(issue.status) && ' (已逾期)'}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  )

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          日历视图
        </Title>
        <Space>
          <Select
            value={viewMode}
            onChange={(val: ViewMode) => setViewMode(val)}
            style={{ width: 120 }}
          >
            <Select.Option value="month" icon={<AppstoreOutlined />}>月视图</Select.Option>
            <Select.Option value="week" icon={<UnorderedListOutlined />}>周视图</Select.Option>
            <Select.Option value="list" icon={<UnorderedListOutlined />}>列表</Select.Option>
          </Select>
          <Button icon={<LeftOutlined />} onClick={() => navigateDate(-1)}>上一周期</Button>
          <Button onClick={goToToday}>今天</Button>
          <Button onClick={() => navigateDate(1)}>下一周期<RightOutlined /></Button>
          <Button icon={<ReloadOutlined />}>刷新</Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Text strong style={{ fontSize: 18 }}>
          {viewMode === 'list' 
            ? '事项时间线' 
            : currentDate.format(viewMode === 'month' ? 'YYYY年MM月' : 'YYYY年MM月DD日 第W周')
          }
        </Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_NAMES).map(([status, name]) => (
          <Tag key={status} color={STATUS_COLORS[status as IssueStatus]}>
            {name}
          </Tag>
        ))}
      </div>

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'list' && renderListView()}

      <Modal
        title={selectedDate ? selectedDate.format('YYYY年MM月DD日') + ' 的事项' : '事项列表'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={selectedIssues}
          locale={{ emptyText: <Empty description="该日期无事项" /> }}
          renderItem={issue => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => handleIssueClick(issue)}
            >
              <List.Item.Meta
                avatar={<Tag color={STATUS_COLORS[issue.status]}>{STATUS_NAMES[issue.status]}</Tag>}
                title={
                  <Space>
                    <Text strong>{issue.issueKey}</Text>
                    <Text>{issue.summary}</Text>
                  </Space>
                }
                description={
                  <Space>
                    {issue.startDate && (
                      <Text type="secondary">
                        开始: {dayjs(issue.startDate).format('YYYY-MM-DD')}
                      </Text>
                    )}
                    {issue.dueDate && (
                      <Text type="secondary">
                        截止: {dayjs(issue.dueDate).format('YYYY-MM-DD')}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  )
}

export default CalendarView
