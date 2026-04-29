import React from 'react'
import { Card, Row, Col, Statistic, Typography, Empty, Tabs } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useIssueStore } from '@/stores/issueStore'
import { useProjectMetaStore } from '@/stores/projectMetaStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

const { Title, Text } = Typography

const Reports: React.FC = () => {
  const { issues, issueTypes } = useIssueStore()
  const { sprints } = useProjectMetaStore()

  const statusData = [
    { name: '待办', value: issues.filter(i => i.status === 'todo').length, color: '#1890ff' },
    { name: '进行中', value: issues.filter(i => i.status === 'in_progress').length, color: '#722ed1' },
    { name: '审核中', value: issues.filter(i => i.status === 'review').length, color: '#faad14' },
    { name: '已完成', value: issues.filter(i => i.status === 'done').length, color: '#52c41a' },
    { name: '已关闭', value: issues.filter(i => i.status === 'closed').length, color: '#8c8c8c' },
    { name: '已阻塞', value: issues.filter(i => i.status === 'blocked').length, color: '#f5222d' },
  ].filter(d => d.value > 0)

  const issueTypeData = issueTypes.map(type => ({
    name: type.name,
    value: issues.filter(i => i.issueTypeId === type.id).length,
    color: type.color,
  })).filter(d => d.value > 0)

  const priorityData = [
    { name: '最高', value: issues.filter(i => i.priority === 'highest').length },
    { name: '高', value: issues.filter(i => i.priority === 'high').length },
    { name: '中', value: issues.filter(i => i.priority === 'medium').length },
    { name: '低', value: issues.filter(i => i.priority === 'low').length },
    { name: '最低', value: issues.filter(i => i.priority === 'lowest').length },
  ]

  const sprintPerformanceData = sprints
    .filter(s => s.status === 'completed' || s.status === 'active')
    .map(s => ({
      name: s.name,
      planned: Math.floor(Math.random() * 30) + 10,
      completed: Math.floor(Math.random() * 25) + 5,
    }))

  const burndownData = [
    { day: 'Day 1', ideal: 50, actual: 50 },
    { day: 'Day 2', ideal: 45, actual: 48 },
    { day: 'Day 3', ideal: 40, actual: 42 },
    { day: 'Day 4', ideal: 35, actual: 38 },
    { day: 'Day 5', ideal: 30, actual: 35 },
    { day: 'Day 6', ideal: 25, actual: 30 },
    { day: 'Day 7', ideal: 20, actual: 25 },
    { day: 'Day 8', ideal: 15, actual: 18 },
    { day: 'Day 9', ideal: 10, actual: 12 },
    { day: 'Day 10', ideal: 5, actual: 8 },
  ]

  const tabItems = [
    {
      key: 'overview',
      label: (
      <span>
        <BarChartOutlined /> 概览报表
      </span>
    ),
    },
    {
      key: 'burndown',
      label: (
      <span>
        <LineChartOutlined /> 燃尽图
      </span>
    ),
    },
    {
      key: 'velocity',
      label: (
      <span>
        <RiseOutlined /> 速度图
      </span>
    ),
    },
    {
      key: 'distribution',
      label: (
      <span>
        <PieChartOutlined /> 分布图
      </span>
    ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>报表中心</Title>
        <Text type="secondary">项目数据统计与可视化分析</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总事项数"
              value={issues.length}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={issues.filter(i => ['in_progress', 'review'].includes(i.status)).length}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={issues.filter(i => ['done', 'closed'].includes(i.status)).length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="迭代数"
              value={sprints.length}
              prefix={<TeamOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="overview" items={tabItems}>
          <Tabs.TabPane tab="概览报表" key="overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="状态分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="优先级分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1890ff" name="数量" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={24}>
                <Card title="事项类型分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={issueTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" name="数量">
                        {issueTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="燃尽图" key="burndown">
            <Card title="迭代燃尽图">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ideal"
                    stroke="#ffc069"
                    strokeDasharray="5 5"
                    fill="#fff7e6"
                    name="理想进度"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#1890ff"
                    fill="#e6f7ff"
                    name="实际进度"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab="速度图" key="velocity">
            <Card title="迭代速度趋势">
              {sprintPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sprintPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#1890ff" name="计划故事点" />
                  <Bar dataKey="completed" fill="#52c41a" name="完成故事点" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无已完成的迭代数据" />
            )}
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab="分布图" key="distribution">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="状态分布饼图">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="类型分布柱状图">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={issueTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="数量">
                        {issueTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Reports
