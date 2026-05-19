import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  LoginOutlined
} from '@ant-design/icons'
import { logApi } from '@/services'
import { useAuthStore } from '@/store/auth'
import { isSuperAdmin } from '@/utils/permission'

interface Statistics {
  totalUsers: number
  totalGroups: number
  totalProjects: number
  totalApis: number
  todayLogins: number
  yesterdayLogins: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (isSuperAdmin(user?.role)) {
      loadStatistics()
    }
  }, [user?.role])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const res = await logApi.getStatistics()
      setStats(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">仪表盘</h2>
      </div>

      {isSuperAdmin(user?.role) ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="用户总数"
                value={stats?.totalUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="分组总数"
                value={stats?.totalGroups || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="项目总数"
                value={stats?.totalProjects || 0}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="接口总数"
                value={stats?.totalApis || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="今日登录"
                value={stats?.todayLogins || 0}
                prefix={<LoginOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card loading={loading}>
              <Statistic
                title="昨日登录"
                value={stats?.yesterdayLogins || 0}
                prefix={<LoginOutlined />}
                valueStyle={{ color: '#a0d911' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Card>
          <div className="stat-card">
            <div className="stat-value">欢迎使用 API 接口管理平台</div>
            <div className="stat-label">
              当前角色: {user?.role ? (user.role === 'group_admin' ? '分组管理员' : user.role === 'project_admin' ? '项目管理员' : user.role === 'member' ? '普通成员' : '访客') : ''}
            </div>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 24 }} title="功能说明">
        <ul style={{ paddingLeft: 20, lineHeight: '28px' }}>
          <li><strong>用户管理</strong>：管理平台用户账号，支持禁用/启用、批量操作</li>
          <li><strong>分组管理</strong>：创建和管理业务分组，设置分组负责人</li>
          <li><strong>项目管理</strong>：创建项目，配置全局参数，管理项目成员</li>
          <li><strong>接口管理</strong>：可视化编辑接口，支持 Mock 服务</li>
          <li><strong>登录日志</strong>：查看用户登录记录，保障账号安全</li>
        </ul>
      </Card>
    </div>
  )
}
