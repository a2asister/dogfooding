import React, { useEffect, useMemo } from 'react'
import { Row, Col, Card, Statistic, Progress, Table, Tag, Button, Space, Typography } from 'antd'
import {
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BugOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { projects, fetchProjects } = useProjectStore()
  const { currentUser } = useAuthStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const activityData = [
    { name: '周一', created: 4, resolved: 3, closed: 2 },
    { name: '周二', created: 3, resolved: 4, closed: 3 },
    { name: '周三', created: 5, resolved: 3, closed: 4 },
    { name: '周四', created: 2, resolved: 5, closed: 3 },
    { name: '周五', created: 6, resolved: 4, closed: 5 },
    { name: '周六', created: 1, resolved: 2, closed: 1 },
    { name: '周日', created: 0, resolved: 1, closed: 0 },
  ]

  const statusData = [
    { name: '待办', value: 12, color: '#1890ff' },
    { name: '进行中', value: 8, color: '#722ed1' },
    { name: '审核中', value: 4, color: '#faad14' },
    { name: '已完成', value: 25, color: '#52c41a' },
    { name: '已关闭', value: 6, color: '#8c8c8c' },
  ]

  const sprintData = [
    { name: 'Sprint 1', completed: 45, total: 50 },
    { name: 'Sprint 2', completed: 38, total: 45 },
    { name: 'Sprint 3', completed: 30, total: 40 },
    { name: 'Sprint 4', completed: 20, total: 35 },
  ]

  const recentProjects = useMemo(() => {
    return projects.slice(0, 5).map(p => ({
      key: p.id,
      name: p.name,
      keyName: p.key,
      category: p.category,
      status: 'active',
      members: Math.floor(Math.random() * 10) + 1,
      progress: Math.floor(Math.random() * 100),
    }))
  }, [projects])

  const tableColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: typeof recentProjects[0]) => (
      <a onClick={() => navigate(`/projects/${record.key}`)}>
        {text}
      </a>
    ),
    },
    {
      title: '项目标识',
      dataIndex: 'keyName',
      key: 'keyName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '成员数',
      dataIndex: 'members',
      key: 'members',
      render: (count: number) => (
      <Space>
        <TeamOutlined />
        <span>{count} 人</span>
      </Space>
    ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
      <Progress percent={progress} size="small" style={{ width: 120 }} />
    ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: typeof recentProjects[0]) => (
      <Space>
        <Button type="link" size="small" onClick={() => navigate(`/projects/${record.key}`)}>
          查看
        </Button>
      </Space>
    ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          欢迎回来，{currentUser?.displayName || currentUser?.username}！
        </Title>
        <Text type="secondary">以下是您的项目概览</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/projects')}>
            <Statistic
              title="我的项目"
              value={projects.length}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">点击查看全部</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="待处理事项"
              value={23}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 12 }}>
              <Progress percent={65} size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本周已完成"
              value={15}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="success">+3 对比上周</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="活跃迭代"
              value={2}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">2 个即将到期</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={
            <Space>
              <BarChartOutlined />
              <span>事项趋势分析</span>
            </Space>
          } extra={<Button type="link" size="small">查看详情</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" name="创建" fill="#1890ff" />
                <Bar dataKey="resolved" name="解决" fill="#52c41a" />
                <Bar dataKey="closed" name="关闭" fill="#722ed1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={
            <Space>
              <PieChartOutlined />
              <span>状态分布</span>
            </Space>
          }>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <RiseOutlined />
              <span>迭代速度</span>
            </Space>
          }>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sprintData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" name="已完成" stroke="#52c41a" strokeWidth={2} />
                <Line type="monotone" dataKey="total" name="计划" stroke="#1890ff" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <CalendarOutlined />
              <span>快速操作</span>
            </Space>
          }>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  icon={<ProjectOutlined />}
                  onClick={() => navigate('/projects')}
                  style={{ height: 60 }}
                >
                  <div>
                    <div>新建项目</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>创建新项目</Text>
                  </div>
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<BugOutlined />}
                  onClick={() => {}}
                  style={{ height: 60 }}
                >
                  <div>
                    <div>新建事项</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>创建新事项</Text>
                  </div>
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<BarChartOutlined />}
                  onClick={() => {}}
                  style={{ height: 60 }}
                >
                  <div>
                    <div>查看报表</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>数据分析</Text>
                  </div>
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => {}}
                  style={{ height: 60 }}
                >
                  <div>
                    <div>迭代规划</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>规划迭代</Text>
                  </div>
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title={
        <Space>
          <ProjectOutlined />
          <span>最近项目</span>
        </Space>
      } extra={<Button type="link" size="small" onClick={() => navigate('/projects')}>查看全部</Button>}>
        <Table
          columns={tableColumns}
          dataSource={recentProjects}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default Dashboard
